---
title: "Nexus Runtime: What It Takes to Make an Autonomous Agent Deterministic"
description: "What it takes to make an autonomous agent deterministic: event sourcing, vector clocks, stateless workers, and crash recovery tested with kill -9."
date: 2026-08-06
updated: 2026-08-06
tags: ["rust", "event-sourcing", "distributed systems", "agents", "determinism"]
repo: https://github.com/Fengrru/nexus-runtime
---


Autonomous agents are, by default, a mess to operate. They call LLM APIs that cost real money, they mutate files and databases, they talk to other agents — and they crash. When an agent crashes mid-task, three bad things happen: you pay for the LLM calls again, you replay the side effects, or you silently diverge from the state you thought you were in. Most agent frameworks simply accept this.

**Nexus Runtime** is a Rust substrate I have been building since early 2026 that treats the problem as a distributed-systems problem rather than a prompt-engineering problem. The core principle is one sentence:

> **The event log is the source of truth. State is a materialized view. Workers are stateless. The Kernel owns causality.**

This post is a walkthrough of how that principle is enforced in code: a pure state machine, event sourcing with vector clocks, crash recovery that never re-calls the LLM, and acceptance tests that literally `kill -9` the process mid-flight.

Source: [github.com/Fengrru/nexus-runtime](https://github.com/Fengrru/nexus-runtime)

## 1. The problem

An agent run looks like this: a user gives an intent, an LLM produces an execution plan, workers execute steps (read files, run commands, call tools), and each step might trigger another LLM call. Every step has three properties that make it hostile to naive retries:

1. **LLM calls are paid.** Re-running a plan after a crash costs money and can produce a *different* plan, because LLM inference is stochastic.
2. **Side effects are irreversible-ish.** `write_file` twice is not the same as `write_file` once. A retry that re-applies a mutation is a bug.
3. **Time is not free.** If you restart from scratch, the world has moved on. Locks, API sessions, and files may have changed.

The standard answer in enterprise software is a workflow engine with durable execution — Temporal, Azure Durable Functions, and so on. Nexus takes that idea and adds a requirement those systems do not have: **causal consistency across sessions and agents, enforced end-to-end by a single data structure.**

## 2. State is a materialized view

The architecture is a five-layer stack:

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

Everything in L3–L5 is disposable. Workers are spawned per task, hold no state, and communicate with the Kernel only through a JSON-RPC 2.0 protocol framed as NDJSON over stdio — a deliberate rejection of network transports, so that a worker failure surface is just "the process died."

The only thing that must survive is the append-only event log. `NexusState` — the whole session — is recomputed by replaying events through a pure function. There is no "save the state" step that can go wrong, because the state was never the source of truth.

## 3. The pure transition function

At the heart of the Kernel is `transition()` in `crates/nexus-core/src/state_machine.rs`:

```rust
pub fn transition(
    current: &NexusState,
    event: &NexusEvent,
    dag: &BTreeMap<TaskId, TaskNode>,
) -> Result<NexusState, TransitionError>
```

Its doc comment states the contract that everything else in the project is built to preserve: *pure — no async, no I/O, no clock, no random.* Every event gets three pre-checks:

- **Session match** — an event for another session is rejected outright.
- **Causal validity** — the event's vector clock must be monotonically ahead of the current state's clock (`is_causally_valid`). A stale event arriving out of order is rejected, not silently applied.
- Then the transition runs and increments `version` and merges the causal vector — unconditionally, because if you passed the checks, the event is *part of history* and must be recorded even if the state machine decides the transition is illegal.

The state machine itself is a big match on `(status, event_type)`. The main arc:

```
Created → Intake → Planning → Planned → Executing → Checkpointing → Executing → ...
                                        ↘ Converging → Reflecting → Completed
                                        ↘ Failed
```

Some of my favorite details live in the edge cases:

- `Executing + WorkerFailed` with a retryable error code and remaining retry quota returns to `Planned`; the recovery plan then re-dispatches *only the failed step*.
- `Planned + DependenciesMet` checks the execution frontier: if the DAG contains a fan-in node, the session enters `Converging` — a separate phase with its own events, because multi-agent convergence is causally different from linear execution.
- Governance can interrupt anything: `HumanApprovalRequested` from `Executing`/`Checkpointing`/`Planned` moves the session to `Blocked`, and `HumanApproved`/`HumanRejected` resolve it.
- `SessionArchived` is reachable from ten different states, because archive must be a legal operation no matter where the session died.

There are 28 `EventType` variants total, tagged as `snake_case` strings in MessagePack. Every variant has a valid-transition unit test and an illegal-transition rejection test.

## 4. Determinism by construction, not by convention

"Be deterministic" is the kind of rule that everyone agrees with and nobody enforces. Nexus enforces it in four layers, so that violations are compile errors rather than late-night bugs.

### Layer 1: the compiler bans the worst offenders

Every crate has:

```rust
#![deny(clippy::disallowed_types)]
```

with `.clippy.toml` mapping `HashMap` and `HashSet` to "use BTreeMap/BTreeSet". The reason is not performance — it is that `HashMap` iteration order is randomized per process, so two runs serializing the same logical state can emit different bytes. `BTreeMap` gives a canonical order for free. This single rule removes an entire class of "it works on my machine" serialization bugs.

### Layer 2: the type system bans floats

Serialized state uses `u64` for timestamps and currency (`BudgetState` is cents as `u64`, not dollars as `f64`). No `f32`/`f64`/`DateTime`/`SystemTime` may appear in serialized state. If a number must round-trip through MessagePack byte-identically, it is an integer.

### Layer 3: one canonical binary format

State serializes with `rmp-serde` (MessagePack) using structured maps and big-endian byte order — a fixed byte-level encoding. JSON is explicitly rejected for state because key ordering makes it non-canonical. The protocol module provides `serialize_deterministic()` as the single entry point, so there is one way to produce bytes and one way to parse them.

For content addressing, everything is **BLAKE3**: artifacts, vault entries, LLM prompt cache keys. SHA-256 exists in exactly one place: a chained integrity hash on `NexusEvent` that binds `event_id + payload + session + timestamp + nonce + causal_vector`, so any tampering with history breaks the chain.

### Layer 4: golden fixtures make regressions loud

`fixtures/checkpoint_v0.msgpack` is the byte-level golden checkpoint. A golden test `include_bytes!`s it and asserts the freshly serialized state is byte-identical. If anyone changes serialization format, message ordering, or a type definition, the test fails with a diff — not a silent migration. There is a sibling test that runs two transitions and asserts both produce identical state.

The combination means: non-determinism is not a property you need to remember to respect; it is something you have to actively fight the compiler to introduce.

## 5. The causal vector: one structure, three layers

The single most reused type in the codebase is:

```rust
pub struct CausalVector(pub BTreeMap<SessionId, u64>);
```

A vector clock — one counter per session. Its API is the whole theory of causal consistency in four methods:

- `increment(session)` — advance my own counter.
- `merge(other)` — component-wise `max`; idempotent, so replaying an event twice is a no-op on the clock.
- `happened_before(other)` — true if every component is `≤` and at least one is strictly less (or the vector has strictly more dimensions). This is the classic *happened-before* relation.
- `is_concurrent(other)` — neither happened-before the other.

The same type enforces causality at three different layers:

1. **State machine** — every event carries the vector; `transition()` rejects events that violate monotonicity.
2. **Message bus** (`nexus-message-bus`) — every `CausalMessage` carries a vector; `receive_ordered()` topologically sorts a queue of pending messages by `compare()`. Messages that happen-before each other are delivered in causal order; *concurrent* messages — which have no causal obligation — are delivered in timestamp order as a stable, deterministic tiebreak.
3. **Recovery** — replay validates monotonicity event-by-event, so a corrupted or reordered log is caught before it produces a corrupted state.

The nice property of using one type everywhere is that the semantics are defined once. `compare()` in `nexus-core` returns `CausalRelation::{Before, After, Concurrent}`, and the message bus never re-implements partial-order logic — it just calls it.

## 6. Recovery: what actually happens after `kill -9`

This is the part that distinguishes Nexus from a state machine demo. `recover_from_events()` in `crates/nexus-core/src/recovery.rs` runs a fixed pipeline:

1. **Integrity check** — SQLite `PRAGMA integrity_check`; the store is append-only by construction (the `events` table in `schema.sql` uses `STRICT` mode, WAL journaling, and has no `UPDATE`/`DELETE` paths).
2. **Load events** — all events for the session.
3. **Monotonicity check** — verify the causal vector advances at every step, rejecting a corrupted log.
4. **Replay** — feed every event to `transition()` from an empty state, and rebuild the task DAG from `IntentParsed` onward. Same events → byte-identical state. This is not "approximately" true; the golden tests assert it byte-for-byte.
5. **Artifact verification** — every `ArtifactRef` carries a BLAKE3 hash of its content. Recovery re-reads the file at its `vault://` URI and recomputes the hash, so a deleted or corrupted artifact is detected, not silently loaded.
6. **Cost integrity** — the store records every LLM call. Recovery checks `llm_unique_count == llm_total_count`. If the log contains a duplicated LLM invocation, recovery refuses to proceed. This is the invariant that guarantees you never pay twice for the same reasoning.
7. **Recovery plan** — if the session was mid-execution, produce a `RecoveryPlan` with `from_step` and a `ReplayAction` list (read/edit file, run command, LLM call, MCP invoke, git commit) plus a registry of external handles (file locks, API sessions, DB connections) to re-acquire.

Two mechanisms make step 4–6 possible:

- **Checkpointing.** Every worker step emits a `WorkerCheckpoint` event before it acts. The recovery manager scans the log, finds the last checkpoint, and resumes from there. A `StaleCheckpoint` error guards against a checkpoint sequence behind the current one — workers cannot accidentally regress.
- **The LLM proxy caches by prompt hash.** Before an LLM call, the proxy hashes the prompt (BLAKE3) and checks the log. On recovery, a cached result produces the `NexusEvent` directly from the log instead of re-contacting the API. This is the design documented in ADR-001: **the LLM proposes, the runtime validates, execution commits** — and the proposal is a logged artifact, not a transient HTTP response.

The result: you can kill the process at *any* event boundary, restart with `nexus resume <session-id>`, and the session resumes with the same version number, the same causal vector, and zero duplicate side effects or LLM charges.

## 7. Governance: side effects, budgets, and capabilities

Deterministic replay solves crashes, but a single agent with full permissions is still dangerous. Nexus layers three guardrails between the state machine and the world.

### Side-effect two-phase commit

Side effects are first-class events with an intent/commit split:

```
SideEffectIntent → SideEffectCommitted | SideEffectCompensated
```

Every effect is classified as `Pure`, `Idempotent`, `Reversible`, or `Irreversible`. Reversible effects carry `CompensationData` — the SQL to roll back, the undo command — so an aborted convergence can compensate rather than replay. An irreversible effect in the log is a permanent fact, and the recovery plan treats it accordingly.

### Cost governor

`BudgetState` is `u64` cents with saturating arithmetic. The LLM proxy checks the budget *before* every call, and the state machine rejects `BudgetExceeded` transitions — spending is a state transition like anything else, so overspending cannot be recovered into by a replay.

### Capability tokens and sandbox tiers

`nexus-security` implements capability tokens as HMAC-SHA256-signed strings binding `version:scope:session:task:expires:issued`. Verification checks expiry, version, and signature; `permits()` does prefix matching over a canonicalized path (with `..` traversal defeated before comparison). A token granting `/project/src` implicitly grants `/project/src/auth` but not `/project/src-secret`.

On Linux, `SandboxTier` picks the strongest available isolation: Tier 0 is Landlock (kernel ≥ 5.13) + seccomp + read-only rootfs, Tier 1 is seccomp + path whitelist, Tier 2 is command auditing — with `best_available()` degrading automatically so the same code runs everywhere.

There is also an **entropy controller** — a small feedback loop that weights retry rate, failure rate, and divergence (`0.4 · retry + 0.4 · failure + 0.2 · divergence`) and halts execution or reduces parallelism when the session starts thrashing. Agents are not supposed to run until they succeed; they are supposed to run until the signal says stop.

## 8. Phoenix: acceptance tests that kill the process

Unit tests prove the state machine works. The `phoenix-tests` crate proves it survives reality. It defines **eight invariants** that must hold after *any* fault scenario:

| # | Invariant | What it checks |
|---|-----------|----------------|
| I-1 | State authority | Database integrity after crash |
| I-2 | Checkpoint identity | Checkpoint id/step stable across restarts |
| I-3 | Replay integrity | Replayed state version matches expected |
| I-4 | Artifact integrity | All artifacts have valid nonzero BLAKE3 hashes |
| I-5 | Determinism context | Seed/model/input hash preserved |
| I-6 | Cost integrity | Unique LLM calls == total LLM calls |
| I-7 | Resume continuity | Checkpoint sequence strictly advances |
| I-8 | Eventual consistency | Replay view == store view |

The scenarios are the interesting part: **kill -9 at intake, planning, executing, checkpointing, converging, and reflecting** — six different moments of death — plus worker crashes, LLM API timeouts, side-effect crashes, and cross-session resumes. After each fault, the suite restarts the session and asserts all eight invariants.

I-6 is the one I care about most, because it is the economic guarantee: after a kill-9 mid-execution, the restarted session must show the same number of unique LLM calls as total calls. If recovery ever re-invoked the API, this test fails. It is the automated version of "we will not bill you twice."

## 9. Distributed and coordinated operation

Two crates extend the model beyond a single machine:

- **`nexus-message-bus`** — a distributed causal bus with the vector-clock delivery described above, plus gossip heartbeats for node discovery and TTL-bounded routing that prevents ring loops.
- **`nexus-coordinator`** — multi-agent agreement as a five-phase protocol: `Propose → Validate → Commit → Abort → Converge`, with quorum voting. Convergence is the phase where the fan-in DAG nodes gather results from parallel agents — the same `Converging` session state the state machine transitions into.

The schedulers (`Local`, `Docker`, `Kubernetes`) dispatch workers with explicit capability requirements (`Exclusive` vs `Shared`), and a Temporal adapter is in development for environments that already standardize on durable execution.

## 10. Lessons

Building Nexus has been a decade of distributed-systems ideas applied to the messy new world of agents, and a few lessons stand out:

1. **Enforce determinism at compile time, not in review.** The `HashMap` ban is the highest-leverage rule in the project. Reviews catch logic errors; the compiler catches nondeterminism before it becomes a byte-diff in a golden test.
2. **The LLM is an external dependency like any other.** Caching by prompt hash, logging every call, and checking budgets in the state machine made LLM calls boring. Boring is the goal.
3. **Kill the process, then trust the tests.** The golden fixtures and Phoenix invariants overlap deliberately: the first proves serialization is canonical, the second proves recovery is correct. When a change breaks both, the fix is usually in the shared assumption — the causal vector — which is exactly where you want to look.
4. **A vector clock is a tiny amount of code with enormous discipline attached.** `increment`, `merge`, `happened_before` — maybe thirty lines total. But once every event, message, and recovery step is required to thread it through, "causal consistency" stops being a paper concept and becomes an enforced property of the system.

The code is open source under MIT/Apache-2.0: [github.com/Fengrru/nexus-runtime](https://github.com/Fengrru/nexus-runtime), with the protocol specs and ADRs in the repo's `docs/` directory. The state machine, event store, and recovery engine are stable; Kubernetes scheduling and Temporal integration are the active frontiers.
