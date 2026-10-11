---
title: "Nexus Runtime：让一个自主智能体变得确定性，需要付出什么"
description: "让自主智能体变得确定性需要什么：事件溯源、向量时钟、无状态 worker，以及用 kill -9 实测的崩溃恢复。"
date: 2026-08-06
updated: 2026-08-06
tags: ["rust", "event-sourcing", "distributed systems", "agents", "determinism"]
repo: https://github.com/Fengrru/nexus-runtime
---

自主智能体默认就是一团运维噩梦。它们调用要花真金白银的 LLM API，会改动文件和数据库，会和其他智能体通信——然后会崩溃。当一个智能体在任务中途崩溃时，三件坏事会同时发生：你得为那些 LLM 调用再付一次钱、副作用被重放一遍，或者你悄无声息地和以为自己处在的状态发生了偏离。大多数智能体框架只是默认接受这一点。

**Nexus Runtime** 是我从 2026 年初开始构建的一个 Rust 底座，它把这个当成一个分布式系统问题，而不是提示词工程问题来处理。核心原则只有一句话：

> **事件日志是唯一事实来源。状态只是物化视图。Worker 是无状态的。因果性归 Kernel 所有。**

这篇文章会带你走一遍这条原则在代码里是怎么被强制执行的：一个纯状态机、带向量时钟的事件溯源、永不重复调用 LLM 的崩溃恢复，以及字面意义上用 `kill -9` 在运行中杀进程的验收测试。

源码：[github.com/Fengrru/nexus-runtime](https://github.com/Fengrru/nexus-runtime)

## 1. 问题

一次智能体运行是这样的：用户给出意图，LLM 产出执行计划，worker 执行各个步骤（读文件、跑命令、调工具），而每一步都可能触发另一次 LLM 调用。每一步都有三个性质，让天真的重试变成灾难：

1. **LLM 调用是要付费的。** 崩溃后重跑一遍计划既花钱，还可能产出一个**不同的**计划，因为 LLM 推理是随机的。
2. **副作用接近于不可逆。** `write_file` 两次和 `write_file` 一次不是一回事。重试时把变更再应用一遍，就是 bug。
3. **时间不是免费的。** 如果你从头重启，世界已经往前走了。锁、API 会话和文件可能都变了。

企业软件里的标准答案是带持久化执行的工作流引擎——Temporal、Azure Durable Functions 之类。Nexus 借用了这个思路，并加了一条那些系统没有的要求：**跨会话、跨智能体的因果一致性，由单一数据结构端到端地强制执行。**

## 2. 状态是物化视图

架构是一个五层栈：

```
L5: Agent interface adapters      OpenClaw / Hermes / Nexus CLI
L4: Nexus Kernel (Rust)           Causal state machine · Event store · Recovery
                                  Scheduler · Entropy controller · Side-effect guard
L3: Worker fabric                 Python / Node.js / Rust / WASM via JSON-RPC 2.0 over stdio
                                  (no ports, no network, no persistent state)
L2: Causal memory & persistence   Event log · Memory graph · Content vault (BLAKE3)
                                  Vector clocks · Two-phase commit
L1: External toolchain            LLM APIs · Docker/K8s · OPA/Rego policies
```

L3–L5 里的所有东西都是可抛弃的。Worker 按任务生成，不持有任何状态，只通过一套以 NDJSON 帧、走 stdio 的 JSON-RPC 2.0 协议和 Kernel 通信——这是刻意拒绝网络传输，这样 worker 的失败面就只剩下“进程死了”这一件事。

唯一必须活下来的是只追加的事件日志。`NexusState`——整个会话——是通过把一个纯函数作用在事件回放上重新算出来的。没有“保存状态”这一步可以出错，因为状态从来就不是事实来源。

## 3. 纯转移函数

Kernel 的核心是 `crates/nexus-core/src/state_machine.rs` 里的 `transition()`：

```rust
pub fn transition(
    current: &NexusState,
    event: &NexusEvent,
    dag: &BTreeMap<TaskId, TaskNode>,
) -> Result<NexusState, TransitionError>
```

它的文档注释写明了整个项目都为之服务的那条契约：*纯 —— 无 async、无 I/O、无时钟、无随机。* 每个事件都要过三道前置检查：

- **会话匹配** —— 属于另一个会话的事件直接拒绝。
- **因果有效性** —— 事件的向量时钟必须在当前状态的时钟上单调领先（`is_causally_valid`）。一个乱序到达的陈旧事件会被拒绝，而不是被悄悄应用。
- 然后转移执行，并且**无条件地**递增 `version`、合并因果向量——因为如果你通过了检查，这个事件就**是历史的一部分**，即使状态机判定这次转移非法，它也必须被记录下来。

状态机本身是一个基于 `(status, event_type)` 的大 match。主干走向：

```
Created → Intake → Planning → Planned → Executing → Checkpointing → Executing → ...
                                        ↘ Converging → Reflecting → Completed
                                        ↘ Failed
```

我最喜欢的一些细节藏在边界情况里：

- `Executing + WorkerFailed`，如果错误码可重试且还有重试额度，就回到 `Planned`；随后的恢复计划**只重新派发失败的那一步**。
- `Planned + DependenciesMet` 会检查执行前沿：如果 DAG 里存在一个 fan-in 节点，会话就进入 `Converging`——一个拥有自己事件的独立阶段，因为多智能体收敛在因果上和线性执行是两回事。
- 治理可以打断一切：来自 `Executing`/`Checkpointing`/`Planned` 的 `HumanApprovalRequested` 会把会话推到 `Blocked`，再由 `HumanApproved`/`HumanRejected` 解决。
- `SessionArchived` 可以从十个不同的状态到达，因为无论会话死在哪里，归档都必须是一个合法操作。

总共有 28 个 `EventType` 变体，在 MessagePack 里以 `snake_case` 字符串打标签。每个变体都有一个合法转移的单元测试，以及一个非法转移被拒绝的测试。

## 4. 靠构造保证确定性，而不是靠约定

“要有确定性”是那种所有人都同意、但没人执行的规定。Nexus 在四层上强制执行它，让违规变成编译错误，而不是半夜里的 bug。

### 第一层：编译器封杀最坏的元凶

每个 crate 都有：

```rust
#![deny(clippy::disallowed_types)]
```

配上一份 `.clippy.toml`，把 `HashMap` 和 `HashSet` 映射到“请用 BTreeMap/BTreeSet”。原因不是性能——而是 `HashMap` 的迭代顺序是每个进程随机化的，所以两次运行序列化同一份逻辑状态可能产出不同的字节。`BTreeMap` 白送一个规范顺序。仅这一条规则就消灭了一整类“在我机器上是好的”序列化 bug。

### 第二层：类型系统封杀浮点数

序列化状态用 `u64` 表示时间戳和货币（`BudgetState` 是以分为单位的 `u64`，不是以美元为单位的 `f64`）。序列化状态里不允许出现 `f32`/`f64`/`DateTime`/`SystemTime`。如果一个数字必须逐字节地往返 MessagePack，那它就是一个整数。

### 第三层：唯一的规范二进制格式

状态用 `rmp-serde`（MessagePack）序列化，采用结构化 map 和大端字节序——一种固定的字节级编码。JSON 被明确拒绝用于状态，因为键的顺序让它不具备规范性。协议模块提供 `serialize_deterministic()` 作为唯一入口，所以产出字节的方式只有一种，解析字节的方式也只有一种。

内容寻址方面，一切都是 **BLAKE3**：产物、vault 条目、LLM 提示词缓存键。SHA-256 只出现在一个地方：`NexusEvent` 上的链式完整性哈希，它绑定 `event_id + payload + session + timestamp + nonce + causal_vector`，所以任何对历史的篡改都会打断这条链。

### 第四层：黄金夹具让回归变得震耳欲聋

`fixtures/checkpoint_v0.msgpack` 是字节级的黄金 checkpoint。一个黄金测试用 `include_bytes!` 读入它，断言新序列化出来的状态与之逐字节相同。如果有人改动了序列化格式、消息顺序或某个类型定义，测试就会以 diff 的形式失败——而不是悄悄迁移。还有另一个同类测试，跑两次转移并断言两者产出相同的状态。

这些合起来意味着：非确定性不再是一个你需要记得去遵守的性质；它是一个你必须主动和编译器对抗才能引入的东西。

## 5. 因果向量：一个结构，三个层次

代码库里复用最多的类型是：

```rust
pub struct CausalVector(pub BTreeMap<SessionId, u64>);
```

一个向量时钟——每个会话一个计数器。它的 API 就是因果一致性理论的全部，只有四个方法：

- `increment(session)` —— 推进自己的计数器。
- `merge(other)` —— 逐分量取 `max`；幂等，所以把同一个事件重放两次对时钟是无操作。
- `happened_before(other)` —— 如果每个分量都 `≤` 且至少有一个严格更小（或向量维度严格更多），则为真。这就是经典的 happened-before 关系。
- `is_concurrent(other)` —— 两者互不 happened-before。

同一个类型在三个不同的层次上强制执行因果性：

1. **状态机** —— 每个事件都携带这个向量；`transition()` 拒绝违反单调性的事件。
2. **消息总线**（`nexus-message-bus`）—— 每条 `CausalMessage` 都携带一个向量；`receive_ordered()` 按 `compare()` 对待处理消息队列做拓扑排序。互相 happened-before 的消息按因果顺序投递；**并发**消息——彼此没有因果义务——按时间戳顺序投递，作为一个稳定、确定的打破平局规则。
3. **恢复** —— 回放逐个事件验证单调性，所以一份损坏或乱序的日志会在它产出损坏状态之前被抓住。

到处都用同一个类型的好处是，语义只定义一次。`nexus-core` 里的 `compare()` 返回 `CausalRelation::{Before, After, Concurrent}`，消息总线从不重新实现偏序逻辑——它只是调用它。

## 6. 恢复：`kill -9` 之后到底发生了什么

这部分才是 Nexus 和状态机演示的分水岭。`crates/nexus-core/src/recovery.rs` 里的 `recover_from_events()` 跑一条固定的流水线：

1. **完整性检查** —— SQLite 的 `PRAGMA integrity_check`；这个存储在设计上就是只追加的（`schema.sql` 里的 `events` 表使用 `STRICT` 模式、WAL 日志，且没有任何 `UPDATE`/`DELETE` 路径）。
2. **加载事件** —— 该会话的全部事件。
3. **单调性检查** —— 验证因果向量在每一步都在推进，拒绝损坏的日志。
4. **回放** —— 从空状态开始把每个事件喂给 `transition()`，并从 `IntentParsed` 起重建任务 DAG。相同的事件 → 逐字节相同的状态。这不是“大约”成立；黄金测试逐字节地断言它。
5. **产物校验** —— 每个 `ArtifactRef` 都携带其内容的 BLAKE3 哈希。恢复时重新读取 `vault://` URI 处的文件并重算哈希，所以被删除或损坏的产物会被检测出来，而不是被悄悄加载。
6. **成本完整性** —— 存储记录每一次 LLM 调用。恢复时检查 `llm_unique_count == llm_total_count`。如果日志里含有重复的 LLM 调用，恢复拒绝继续。正是这条不变量保证了你不会为同一份推理付两次钱。
7. **恢复计划** —— 如果会话是在执行中途，就产出一份 `RecoveryPlan`，包含 `from_step` 和一份 `ReplayAction` 列表（读/改文件、跑命令、LLM 调用、MCP 调用、git commit），以及一份需要重新获取的外部句柄登记表（文件锁、API 会话、数据库连接）。

有两个机制让第 4–6 步成为可能：

- **Checkpointing。** 每个 worker 步骤在执行之前都会发出一个 `WorkerCheckpoint` 事件。恢复管理器扫描日志，找到最后一个 checkpoint，从那里继续。一个 `StaleCheckpoint` 错误防止 checkpoint 序列落后于当前序列——worker 无法意外回退。
- **LLM 代理按提示词哈希缓存。** 在调用 LLM 之前，代理先对提示词做 BLAKE3 哈希并查日志。恢复时，缓存命中会直接从日志产出 `NexusEvent`，而不重新联系 API。这就是 ADR-001 记录的设计：**LLM 提议，运行时校验，执行提交**——而这个提议是一个被记录在案的产物，不是一次短暂的 HTTP 响应。

结果是：你可以在**任意**事件边界杀掉进程，用 `nexus resume <session-id>` 重启，会话会带着相同的版本号、相同的因果向量恢复，零重复副作用、零重复 LLM 花费。

## 7. 治理：副作用、预算与能力

确定性回放解决了崩溃问题，但一个拥有全部权限的单体智能体依然是危险的。Nexus 在状态机和真实世界之间加了三道护栏。

### 副作用两阶段提交

副作用是一等事件，带意图/提交的分离：

```
SideEffectIntent → SideEffectCommitted | SideEffectCompensated
```

每个效果被归类为 `Pure`、`Idempotent`、`Reversible` 或 `Irreversible`。可逆效果携带 `CompensationData`——用于回滚的 SQL、撤销命令——这样被中止的收敛可以补偿而不是重放。日志里的不可逆效果是永久事实，恢复计划会相应地对待它。

### 成本管理器

`BudgetState` 是以分为单位的 `u64`，使用饱和运算。LLM 代理在**每次**调用**之前**检查预算，状态机会拒绝 `BudgetExceeded` 转移——花钱和别的事情一样是一次状态转移，所以超支无法通过回放被“恢复”回来。

### 能力令牌与沙箱分级

`nexus-security` 把能力令牌实现为 HMAC-SHA256 签名的字符串，绑定 `version:scope:session:task:expires:issued`。校验会检查过期时间、版本和签名；`permits()` 对规范化后的路径做前缀匹配（比较之前先挫败 `..` 穿越）。一个授予 `/project/src` 的令牌隐含授予 `/project/src/auth`，但不授予 `/project/src-secret`。

在 Linux 上，`SandboxTier` 会选择当前可用的最强隔离：Tier 0 是 Landlock（内核 ≥ 5.13）+ seccomp + 只读 rootfs，Tier 1 是 seccomp + 路径白名单，Tier 2 是命令审计——`best_available()` 自动降级，所以同一份代码在哪里都能跑。

还有一个**熵控制器**——一个小反馈环，对重试率、失败率和发散度加权（`0.4 · retry + 0.4 · failure + 0.2 · divergence`），当会话开始剧烈抖动时暂停执行或降低并行度。智能体不该一直跑到成功为止；它们该跑到信号说停为止。

## 8. Phoenix：真的把进程杀掉的验收测试

单元测试证明状态机是对的。`phoenix-tests` crate 证明它在现实里能活下来。它定义了**八条不变量**，在任何故障场景之后都必须成立：

| # | 不变量 | 检查内容 |
|---|-----------|----------------|
| I-1 | 状态权威 | 崩溃后数据库的完整性 |
| I-2 | Checkpoint 同一性 | checkpoint id/step 跨重启稳定 |
| I-3 | 回放完整性 | 回放出的状态版本与期望一致 |
| I-4 | 产物完整性 | 所有产物都有合法且非零的 BLAKE3 哈希 |
| I-5 | 确定性上下文 | 种子/模型/输入哈希被保留 |
| I-6 | 成本完整性 | 唯一 LLM 调用数 == LLM 调用总数 |
| I-7 | 恢复连续性 | checkpoint 序列严格递增 |
| I-8 | 最终一致性 | 回放视图 == 存储视图 |

场景才是最有意思的部分：**在 intake、planning、executing、checkpointing、converging 和 reflecting 处 kill -9**——六个不同的死亡时刻——外加 worker 崩溃、LLM API 超时、副作用崩溃和跨会话恢复。每次故障之后，测试套件都会重启会话并断言全部八条不变量。

I-6 是我最在意的一条，因为它就是经济上的保证：在执行中途 kill -9 之后，重启的会话必须显示唯一 LLM 调用数与总调用数相等。如果恢复过程曾经重新调用过 API，这个测试就会失败。它是“我们不会向你收两次钱”的自动化版本。

## 9. 分布式与协同运行

有两个 crate 把模型扩展到单机之外：

- **`nexus-message-bus`** —— 一个分布式因果总线，带上面描述的向量时钟投递，外加用于节点发现的 gossip 心跳，以及防止环形回路的 TTL 受限路由。
- **`nexus-coordinator`** —— 把多智能体共识实现为一个五阶段协议：`Propose → Validate → Commit → Abort → Converge`，带法定人数投票。收敛阶段是 fan-in DAG 节点从并行智能体那里收集结果的阶段——也就是状态机转入的那个 `Converging` 会话状态。

调度器（`Local`、`Docker`、`Kubernetes`）按明确的能力要求（`Exclusive` 与 `Shared`）派发 worker，另外还有一个 Temporal 适配器在开发中，面向那些已经统一采用持久化执行的环境。

## 10. 教训

构建 Nexus 的过程，是把十年的分布式系统思想应用到智能体这个混乱的新世界上，有几条教训格外突出：

1. **在编译期强制确定性，而不是在代码评审里。** 封杀 `HashMap` 是项目里杠杆最高的一条规则。评审能抓到逻辑错误；编译器能在非确定性变成黄金测试里的字节差异之前就抓住它。
2. **LLM 就是一个普通的外部依赖。** 按提示词哈希缓存、记录每一次调用、在状态机里检查预算，这些让 LLM 调用变得无聊。无聊就是目标。
3. **杀掉进程，然后信任测试。** 黄金夹具和 Phoenix 不变量刻意重叠：前者证明序列化是规范的，后者证明恢复是正确的。当一个改动同时打破两者，修复点通常在它们共同的假设上——那个因果向量——而这正是你想去看的地方。
4. **向量时钟是极少的代码配极高的纪律。** `increment`、`merge`、`happened_before`——总共可能三十行。但一旦每个事件、消息和恢复步骤都被要求把它串过去，“因果一致性”就不再是一个论文概念，而变成了系统被强制执行的性质。

代码以 MIT/Apache-2.0 开源：[github.com/Fengrru/nexus-runtime](https://github.com/Fengrru/nexus-runtime)，协议规范和 ADR 在仓库的 `docs/` 目录里。状态机、事件存储和恢复引擎已经稳定；Kubernetes 调度和 Temporal 集成是当前的前沿。
