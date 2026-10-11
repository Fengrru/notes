# 笔记

**冯宇涵**（Feng Yuhan / [@Fengrru](https://github.com/Fengrru)）的随笔与研究笔记。高中在读，AI 研究，湖南株洲。

[**English →**](README.md)

这个仓库放的是思考本身：我弄错了什么、我注意到了什么、以及那些我放不下的问题。它刻意不做成博客——文章按用途分组，而不按写作时间排列。

论文在别的地方。每一篇论文都有独立的仓库，代码和 PDF 放在一起，见下方[论文](#论文)。

---

## 读什么

| 分组 | 里面有什么 |
|---------|---------------|
| **[研究手记](docs/zh-CN/research-notes/)** | 失败复盘、研究过程的后勤，以及一篇关于 AI 音乐的长篇构想 |
| **[学习与思考](docs/zh-CN/learning/)** | 关于天才、关于评价、关于注意力，以及极客本能为什么仍然重要 |
| **[生活与自我](docs/zh-CN/life/)** | 短篇与对白体——有些关于爱，有些关于学校 |
| **[项目手记](docs/zh-CN/projects/)** | 我真正做过的东西的技术记录 |

### 从这几篇开始

- **[我拿血泪换来的五个死亡陷阱](docs/zh-CN/research-notes/five-death-traps.md)** —— 如果你只看一篇，就看这篇。一个暑假的研究，五个陷阱，五条教训。
- **[AI 会一路给你鼓掌，直到你走进死胡同](docs/zh-CN/research-notes/ai-will-cheer-you-into-a-dead-end.md)** —— AI 辅助研究为什么会这样失败，以及我用来替代它的“先证伪”流程。
- **[你在赢谁的游戏？](docs/zh-CN/learning/whose-game-are-you-winning.md)** —— 考试和 KPI 都是压缩后的代理指标。关于搞清楚自己在玩哪一局。
- **[删掉数据，不等于撤销学习](docs/zh-CN/life/machine-unlearning.md)** —— 机器遗忘，以及它对人意味着什么。

---

## 论文

每篇论文都有独立的仓库，代码和论文放在一起。

| 论文 | 仓库 |
|-------|------------|
| DP-ProtOn：狄利克雷过程引导的在线原型学习 | [dp-proton](https://github.com/Fengrru/dp-proton) |
| Sentinel Attention：带内源性 OOD 信号的误差门控稀疏注意力 | [sentinel-attention](https://github.com/Fengrru/sentinel-attention) |
| Honest Code：仅靠注意力还不够——代码大模型幻觉检测基准 | [repograph-honest](https://github.com/Fengrru/repograph-honest) |
| 当物理无法思考：Port-Hamiltonian 动力学作为神经计算基底的一个负面结果 | [negative-result](https://github.com/Fengrru/negative-result) |
| 持续学习中的存储–计算分离 | [storage-compute-separation](https://github.com/Fengrru/storage-compute-separation) |
| 原型记忆应该什么时候生长？持续学习中的预测误差门控——以及预测编码失败的三条路径 | [prediction-error-gating](https://github.com/Fengrru/prediction-error-gating) |
| 变分信息瓶颈网络中的逐层压缩容忍度 | [predictive-coding-fails](https://github.com/Fengrru/predictive-coding-fails) |
| 音乐运动的连续知觉轨迹假设检验 | [mmt](https://github.com/Fengrru/mmt) |
| 探测音色空间：逆向合成器音色参数的关口实验 | [timbreprobe](https://github.com/Fengrru/timbreprobe) |
| 仪器优先：非平稳生成式音频的可验证测量 | [instrument-first](https://github.com/Fengrru/instrument-first) |
| 当“分割即表征”撞上现实：从 FH 到 SAL | [segmentation-as-representation](https://github.com/Fengrru/segmentation-as-representation) |
| 我用一个月搭了一套因果动力系统理论 | [causal-dynamics](https://github.com/Fengrru/causal-dynamics) |

## 项目

| 项目 | 仓库 |
|---------|------------|
| NeuroLux：用 3D CNN 替换 Minecraft 的 BFS 光照传播 | [neuro-lux](https://github.com/Fengrru/neuro-lux) |
| Nexus Runtime：面向自主智能体的因果一致执行底座 | [nexus-runtime](https://github.com/Fengrru/nexus-runtime) |

---

## 仓库结构

```
README.md            英文导航（本文件为中文版 README.zh-CN.md）
README.zh-CN.md      中文导航
SUMMARY.md           目录，英文
SUMMARY.zh-CN.md     目录，中文
docs/
  en/<section>/<slug>.md        英文正文
  zh-CN/<section>/<slug>.md     中文正文，文件名与英文完全一致
  assets/                       正文引用的图片
scripts/check-parity.mjs        校验两棵树保持 1:1 对应
```

中英是一套镜像：每个文件在两棵树里同名，标题层级与顺序相同，`date` 和 `updated` 一致。提交前跑一次：

```bash
node scripts/check-parity.mjs
```

---

## 许可

文字内容采用 [CC BY-NC 4.0](LICENSE-CONTENT.md) 许可——可以阅读、引用、翻译，但不可商用。脚本采用 [MIT](LICENSE-CODE.md)。

## 在别处

- GitHub: [@Fengrru](https://github.com/Fengrru)
- X: [@YuhanFeng1005](https://x.com/YuhanFeng1005)
- 邮箱：fengru1005@gmail.com
