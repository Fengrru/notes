# Notes

Essays and research notes by **Feng Yuhan** (冯宇涵) — a high-school student and AI researcher in Zhuzhou, China.

[**中文版 →**](README.zh-CN.md)

This repository is where the thinking lives: what I got wrong, what I noticed, and the questions I could not put down. It is deliberately not a blog. The pieces are grouped by what they are for, not by when I wrote them.

The papers are elsewhere. Every paper has its own repository with the code and the PDF together — see [Papers](#papers) below.

---

## Reading

| Section | What is in it |
|---------|---------------|
| **[Research notes](docs/en/research-notes/)** | Failure retrospectives, research logistics, and one long proposal for AI music |
| **[Learning & thinking](docs/en/learning/)** | On genius, evaluation, attention, and why the geek instinct still matters |
| **[Life & self](docs/en/life/)** | Short essays and dialogue pieces — some about love, some about school |
| **[Project notes](docs/en/projects/)** | Technical write-ups for things I actually built |

### A few places to start

- **[5 Death Traps I Learned the Hard Way](docs/en/research-notes/five-death-traps.md)** — if you only read one thing here, read this one. A summer of research, five traps, five lessons.
- **[AI Will Cheer You All the Way Into a Dead End](docs/en/research-notes/ai-will-cheer-you-into-a-dead-end.md)** — why AI-assisted research fails, and the falsification-first pipeline I built to replace it.
- **[Whose Game Are You Winning?](docs/en/learning/whose-game-are-you-winning.md)** — exams and KPIs are compression proxies. On knowing which game you are playing.
- **[Deleting the Data Does Not Undo the Learning](docs/en/life/machine-unlearning.md)** — machine unlearning, and what it says about people.

---

## Papers

Each paper has its own repository, with the code and the paper together.

| Paper | Repository |
|-------|------------|
| Energy-Basin Continual Learning: An Honest Reconstruction and Falsification — corrects the §5.2 creation-rule comparison in DP-ProtOn below | [energy-basin-cl](https://github.com/Fengrru/energy-basin-cl) |
| DP-ProtOn: Dirichlet-Process-Guided Online Prototype Learning for Continual Classification | [dp-proton](https://github.com/Fengrru/dp-proton) |
| Sentinel Attention: Error-Gated Sparse Attention with Endogenous Out-of-Distribution Signals | [pwpf](https://github.com/Fengrru/pwpf) |
| Honest Code: Attention Is Not Enough — A Benchmark of Hallucination Detection for Code LLMs | [repograph-honest](https://github.com/Fengrru/repograph-honest) |
| When Physics Fails to Think: A Negative Result on Port-Hamiltonian Dynamics | [negative-result](https://github.com/Fengrru/negative-result) |
| Storage–Compute Separation for Continual Learning | [storage-compute-separation](https://github.com/Fengrru/storage-compute-separation) |
| When Should a Prototype Memory Grow? Prediction-Error Gating for Continual Learning — and Three Ways Predictive Coding Fails | [prediction-error-gating](https://github.com/Fengrru/prediction-error-gating) |
| Layer-wise Compression Tolerance in Variational Information Bottleneck Networks | [predictive-coding-fails](https://github.com/Fengrru/predictive-coding-fails) |
| Testing the Continuous Perceptual Trajectory Hypothesis for Musical Motion | [mmt](https://github.com/Fengrru/mmt) |
| Probing Timbre Space: Gate Experiments for Inverse Synthesizer Patch Synthesis | [timbreprobe](https://github.com/Fengrru/timbreprobe) |
| Instrument First: Validated Measurement for Non-Stationary Generative Audio | [instrument-first](https://github.com/Fengrru/instrument-first) |
| When "Segmentation as Representation" Hits Reality: From FH to SAL | [segmentation-as-representation](https://github.com/Fengrru/segmentation-as-representation) |
| I Spent a Month Building a Causal Dynamical Systems Theory | [causal-dynamics](https://github.com/Fengrru/causal-dynamics) |

## Projects

| Project | Repository |
|---------|------------|
| NeuroLux: replacing Minecraft's BFS light propagation with a 3D CNN | [neuro-lux](https://github.com/Fengrru/neuro-lux) |
| Nexus Runtime: a causally-consistent execution substrate for autonomous agents | [nexus-runtime](https://github.com/Fengrru/nexus-runtime) |

---

## How this repository is organised

```
README.md            English hub (this file)
README.zh-CN.md      Chinese hub
SUMMARY.md           table of contents, English
SUMMARY.zh-CN.md     table of contents, Chinese
docs/
  en/<section>/<slug>.md        English text
  zh-CN/<section>/<slug>.md     Chinese text, same filenames
  assets/                       images used by the articles
scripts/check-parity.mjs        verifies the two trees stay 1:1
```

English and Chinese are a mirror: every file has the same name in both trees, the same headings in the same order, and the same `date` and `updated` values. Run it before committing:

```bash
node scripts/check-parity.mjs
```

---

## License

Text content is licensed [CC BY-NC 4.0](LICENSE-CONTENT.md) — read it, quote it, translate it, just not commercially. The scripts are [MIT](LICENSE-CODE.md).

## Elsewhere

- GitHub: [@Fengrru](https://github.com/Fengrru)
- X: [@YuhanFeng1005](https://x.com/YuhanFeng1005)
- Email: fengru1005@gmail.com
