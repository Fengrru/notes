---
title: "Six Months on Free Models: The Model Did Not Get Smarter"
description: "My laptop was stolen and my GitHub account was banned. Months of work on a weak machine with free models taught me decomposition and verification — and ended in a one-shot build."
date: 2026-07-23
updated: 2026-07-23
tags: ["AI", "reflection", "technical"]
---


Yesterday I ran a task on a paid AI, and it nailed it on the first try — clean code, airtight logic, every module fitting together perfectly. I stared at the screen for a long moment, and then it hit me: about six months ago, to get the same amount of work done with a free model, I spent an entire afternoon, trying every possible prompt trick, and finally got sabotaged by a completely fabricated API that didn't even exist.

That was when I finally understood — **the model didn't suddenly get smarter. I did.**

And what made me stronger was precisely a string of events that at the time made me want to smash my computer.

---

## I Lost My Laptop, Got Banned from GitHub, and Watched Two Years of Code Vanish Into Thin Air

It started last fall.

I rented a small room near campus and spent my evenings hacking on code after class. One day at noon, I kicked off an AI task before heading out — one of those data processing jobs that takes a while — left my laptop on the bed, screen glowing, fan humming. I thought, no big deal, I'm in my own room.

When I came back that afternoon, the door was shut tight, no signs of forced entry. I took off my shoes, set down my bag, walked over to the bed. The laptop was gone.

I stood there frozen for a solid thirty seconds. I even checked my bag, lifted my pillow, thinking maybe I'd taken it out after all — but I knew I hadn't. I'd checked the progress bar right before I left.

The landlord pulled up the hallway surveillance. The footage showed a figure — walked in empty-handed, walked out with a bulging bag. I filed a police report. Nothing ever came of it.

That machine held every line of code I'd written since freshman year: messy assignments, spontaneous side projects, half-finished competition code — all on the local hard drive. I'd pushed some stuff to GitHub, but only when I remembered, which wasn't often. Most of it never made it to the cloud.

Then, less than two weeks later, my GitHub account got suspended. No warning. "Suspicious activity," they said. I clicked the appeal link and got an auto-reply saying the decision was final. I still don't know what triggered it — maybe the campus shared IP, maybe a repo got flagged by mistake.

Local backup? Gone. Cloud copy? Gone. Clean sweep. Zero balance.

During that time I was just numb. Not angry, not sad — just empty. It was like two years of my existence had been erased, and I had no proof I'd ever written any of it.

But about a month later, I stumbled across some old screenshots I'd taken when submitting assignments. Looking at that code, cold sweat ran down my back — variable names like `a1`, `a2`, `b1`; a single function spanning hundreds of lines with zero comments; empty `try-catch` blocks everywhere; database connections hardcoded right into the business logic — want to change a table structure? That's basically rewriting half the system.

If those codes were still on my hard drive today, I'd probably be clinging to them, thinking they were priceless. But losing them, losing the GitHub backups, forced me to admit one thing: **the only value those projects had was practice.** The code itself had zero long-term significance. If you asked me to maintain any of them today, I'd rather use AI to rewrite them from scratch — half a day at most, ten times cleaner than the originals.

From that day on, my entire mindset toward code changed. It was no longer something worth hoarding. It was just a temporary expression of what was in your head. **What can't be stolen or locked out is your ability to understand problems, your framework for breaking them down, your eye for distinguishing good from bad.** Those things grow on you.

---

## What My Crappy Computer Taught Me: Think Before You Type

After losing my laptop, I couldn't afford a new one right away. I mooched off the school's public computers — the kind that take three minutes to boot and sound like jet engines the moment you open VSCode. Later my roommate lent me his old hand-me-down: an i5 6th-gen, 8GB RAM, mechanical hard drive. Running any serious development environment was pure torture — Docker was out of the question, `npm install` took until the heat death of the universe.

But that crappy machine had an unexpected side effect: **you learn to stop messing around.** Every compile was a long wait; every run was another one; if your logic was wrong, your entire afternoon was gone. So you had to walk through the entire flow in your head first — think through the edge cases, map out the data path — before you dared type a single line of code.

I filled up several sketchbooks with flowcharts, and my phone's notes app was packed with step-by-step breakdowns. The actual time spent coding was minimal; most of the time was spent thinking. That habit has stayed with me to this day, even after getting better equipment and using paid AI. The only difference is that now I think faster, because I've built up a library of patterns in my head.

**That performance bottleneck was actually a filter** — it blocked low-quality trial and error, letting only operations backed by real thinking pass through. At the time it felt like a curse, but looking back, that period might have been when my code was the most solid it's ever been.

---

## Free Models: The Worst Teachers, the Best Coaches

Then came the free models. Honestly, it was just poverty.

Paid AI subscriptions aren't cheap for a student, and token-based APIs were completely out of the question. So I scraped by on free tiers across various platforms, using models with modest parameter counts and limited capabilities.

Free models really aren't great. Ask anything slightly complex and they start hallucinating; ask them to write code and they mix Python and JavaScript syntax; ask them to calculate an average and they get it wrong. But precisely because they were so unreliable, **they forced me to learn how to use them properly.**

One time I needed a Python script to merge a bunch of CSVs, deduplicate, and sort. The free model's first version had a fatal bug — it simply dropped all duplicate rows, when what I needed was to keep the first occurrence for each key. I didn't ask it to fix it. Instead, I broke the task into three steps: first group by key, then take the earliest timestamp in each group, then merge the results. I asked each step individually, manually verified the output of each step, then wired them together myself. It took two hours, but I still remember pandas' `groupby` to this day — because I verified it with my own eyes, line by line.

Free models have tiny context windows too. Paste in a big chunk of code and they forget what you said earlier. So I developed a habit: **always give the most concise context possible.** Cut all the fluff, remove irrelevant functions, keep only the essentials. This forced me to identify what's essential in a piece of code versus what's decoration. Later when I used paid models, I kept this habit — short questions, but extremely high information density.

And the hallucinations. Free models lie with a straight face, with absolute confidence. After getting burned a few times, I developed a reflex — **anything an AI tells me, especially numbers, API names, and config paths, I default to not believing it until I verify it myself.** Either I check the docs, or I write a small test. I never blindly copy-paste.

This habit paid off enormously after I started using paid AI. Paid models are much more accurate, but still not 100%. Because I'd long been trained into a "don't trust, verify" mode, I've almost never fallen into an AI-generated trap.

Because free models lack creativity, I couldn't rely on them to come up with solutions — I had to think through the solution myself and only use them for execution. This taught me to **treat AI like an intern:** give it clear background, objectives, constraints, format, even examples. The more detail you provide, the better the output. That fantasy of "throwing a vague sentence and waiting for magic" got crushed by reality in the first week with a free model.

---

## When It All Came Together in One Project

All of these experiences — the reevaluation of "what constitutes valuable work" after losing all my code, the "think before you write" habit forged on a crappy machine, the decomposition skills and verification instincts ground out through free models — all converged in a single project.

The project is called **Scientific Contradiction Detector**, an academic tool that automatically detects contradictions in research papers.

The core problem is this: a narrow field — say, Chain-of-Thought mathematical reasoning in large language models — produced roughly 200 papers between 2021 and 2026. No single researcher can read them all. Contradictory conclusions get published in different journals, and nobody ever cross-references them. Researchers build on inconsistent foundations without knowing they're standing on different ground.

What this system does: scan 200 papers, extract structured claims, then flag "who contradicts whom on what." It ultimately found **165 verified contradictions**, of which 76% were "inconsistent experimental conditions" — different papers making the same claim, but one testing on GSM8K + GPT-3.5 and the other on MATH + Llama-2. They look identical on the surface but are fundamentally incomparable. This kind of systematic inconsistency had never been documented at scale before.

It's a four-stage pipeline covering the full spectrum from data collection to automatic paper generation:

```
200 papers (arXiv + Semantic Scholar)
  → PDF text extraction (PyMuPDF)
  → Structured claim extraction (DeepSeek API / Llama 3 8B 4-bit quantized)
  → 6-tuple format: Subject | Relation | Object | Condition | Evidence Type | Confidence
  → Data cleaning (ontology normalization + synonym mapping)
  → Candidate contradiction generation (same SRO + opposite relation)
  → Rule engine (4 patterns) + LLM fallback classification
  → Significance scoring (0.6 × log citations + 0.4 × confidence)
  → Streamlit interactive interface + automatic LaTeX paper generation
```

Tech stack: Python 3.10+, PyTorch, Transformers, Llama 3 8B Instruct (4-bit quantized), DeepSeek API, Streamlit, Plotly, PyMuPDF, NetworkX, pandas, scikit-learn. Approximately 20 source files spanning four architectural layers: data, extraction, detection, and output.

The rule engine is the most "me" module — four hardcoded default rules (opposite relations, dataset conflicts, model comparisons, statistical deviations) handle deterministic patterns with **zero hallucination**; a `_find_common_patterns()` function automatically mines new patterns from human-verified contradictions, deriving new detection rules. This is essentially the ultimate expression of "think through the logic first, then let AI write the code" — the rules are human-defined, AI just translates the logic into Python.

The Streamlit frontend has four tabs: statistics dashboard, contradiction browser, paper network graph, and Paper Analyzer (supports PDF upload or text paste, dual-mode extraction via LLM and keywords, real-time comparison against the existing database).

---

## And How Was This Project Actually Built?

This is the part I really want to talk about.

**The actual coding of this project was done on the Windsurf platform, using the free model SWE-1.5, in a single conversation, in one shot.**

But before opening Windsurf, I opened Kimi first.

I wrote an entire design document in Kimi — domain definition, data flow, module decomposition, API design, error handling strategies, config file structure, even what goes on each of the four Streamlit tabs. I wrote it, polished it several times, confirmed there were no logical gaps, then pasted the document as a prompt into Windsurf and let SWE-1.5 start coding.

So strictly speaking, Kimi is where I "thought," and Windsurf is where I "built." Kimi was responsible for turning the architecture in my head into a structured specification; SWE-1.5 was responsible for turning the specification into runnable Python.

No back-and-forth adjustments. No "let's start over." One conversation window, from project initialization to the last Streamlit page rendering — all done.

This sounds like bragging, but if you've read through all the experiences above, you should already understand — this isn't the model being impressive. Those hardships had already forged my "input" to an entirely different level. And Kimi as the "thinking" step was essentially an extension of the habits trained over those six months: **before letting AI do the work, first use another AI to write requirements that are watertight.**

Before opening that conversation window in Windsurf, I already had a complete picture in my head — and in Kimi's document:

- What domain to pick? (CoT mathematical reasoning — concepts are formalizable, 150-500 papers is manageable)
- How does the data flow? (arXiv scraping → PDF download → text extraction → claim extraction → contradiction detection → result output)
- What are the inputs and outputs of each module? (paper_fetcher outputs CSV → pdf_downloader outputs PDF → text_extractor outputs CSV with text → claim_extractor outputs 6-tuples → contradiction_detector outputs contradiction pairs)
- How to design the rule engine? (Hardcode 4 deterministic rules first, leave an interface for automatic derivation)
- What goes on each of the four Streamlit tabs? (Overview, Browse, Network Graph, Analyzer)
- What's the config file structure? (YAML, ${ENV_VAR} pattern parsing for easy deployment)
- Even error handling? (Retry logic, mock mode, backup frequency)

None of this was AI helping me think. AI can't help me think. When a free model can fabricate an API, how could I possibly expect it to design an architecture that actually works?

**All AI did was: translate the logic I'd already figured out into code.** I said "need a RuleEngine class with 4 default rules, each rule a condition_func closure, analyze_pair method returns (type, confidence, matched_rules_list)" — it wrote it. I said "need a `_find_common_patterns` method that counts subject-relation-object co-occurrence patterns from verified data, generates new condition_func by threshold" — it wrote it.

Every line of code it produced, I already had a rough idea of what it would look like before asking it to write it.

This is the muscle memory built over six months with free models: **before opening the chat window, first decompose the problem clearly.** Because I understood free model limitations all too well — if you don't nail down the boundaries, it starts freelancing, and freelancing means a whole afternoon wasted.

---

## The Model Didn't Get Smarter — Your Brain Did

Looking back at these six months, what I want to say is really quite simple:

**Constraints aren't inherently bad — it depends on how you use them.**

If my laptop hadn't been stolen, I'd probably still be clinging to that junk code as if it were treasure. If GitHub hadn't banned me, I might never have asked myself "if I rebuilt from scratch, could I do better?" Without that stretch of time on a crappy machine, I might still be the "throw a bunch of code at it and debug later" type. Without being tormented by free models for months, I'd never have understood what prompting really is.

AI is powerful, but it's passive. The quality of input determines the quality of output. A person who learned to drive manual transmission can handle automatic with ease; a person who only knows automatic will stall the moment they sit behind a manual. I'm the one who drove manual for six months.

The reason I'm efficient now isn't the model — the model just saves me the time of typing. What actually makes me efficient is the workflow I built over these months: **requirement decomposition → architecture design → information organization → cross-verification → never letting AI think for you.** These things are part of you now. No matter what tool you use, they're there.

So if you're stuck using a free model right now, on a crappy computer, hurting because you lost your code — **you might be in the most valuable stretch of the learning curve.** This stretch doesn't give you convenience, but it gives you something far more important: the experience of finding solutions under constraint, the ability to optimize resources in scarcity, the confidence to step up yourself when tools fail. Once these abilities grow on you, nobody can take them away.

And when you finally get your hands on better tools one day, you'll discover — every pitfall you stumbled into, every time you wanted to smash your keyboard over a hallucinating AI, every afternoon you were forced to turn the problem over three extra times in your head because your computer was too slow — none of it was wasted.

At least, for me, it wasn't.

---

*This project is open-sourced under the MIT license. 200 papers, 192 structured claims, 165 verified contradictions — the design was completed in Kimi, all code generated by Windsurf's free model SWE-1.5 in a single conversation window, running on an i5-6200U, 8GB RAM, mechanical hard drive potato of a machine.*
