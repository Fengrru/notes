---
title: "AI Will Cheer You All the Way Into a Dead End"
description: "Ten research directions collapsed in one summer. Why AI-assisted research fails this way, and the falsification-first pipeline I built to replace it."
date: 2026-07-31
updated: 2026-07-31
tags: ["AI", "research", "self-reflection", "lessons"]
---


## How I Fell Into Research

It started in March this year, in a math class about hyperbolas.

I noticed something: you could represent a hyperbola using two parameters of a circle. I was ridiculously excited. I ran to my math teacher, and instead of brushing me off, he encouraged me to write it up properly — an actual paper. That was the door. I walked through it, and my research life began.

I was already a heavy AI user, and around the same time I started getting pulled into AI fundamentals — papers showing up in my feeds, videos, blog posts. Whenever an idea hit me, I'd talk it through with an AI. Sometimes I'd have Kimi run quick experiments to sanity-check a direction — low-cost, fast trial and error. And once a direction "felt validated," I'd hand the whole thing over: let the AI drive the research, run the experiments, build the thing.

That workflow felt like a superpower. It was actually a trap, and I want to describe the trap precisely, because I think a lot of people are walking into it right now.

## The Ten-Project Disaster

At my peak I was pushing roughly **ten research directions simultaneously**. I was still in school, so my routine was: any free moment, run to my teacher's office, borrow his computer, grind experiments, build prototypes.

It felt enormously productive. Here's what it actually produced:

- My grades dropped, because I'd effectively stopped studying.
- Almost everything I built turned out to be worthless — not because the code didn't work, but because **other people had already done it**. Done it better. With far more data, bigger experiments, cleaner results.

And the part that stings: during all those enthusiastic AI conversations where we "developed" my ideas together, the AI never once said *someone already did this*. It never searched. It never pushed back. It just kept helping me build.

## Why AI Cheers You Into the Wall

My first instinct was to blame my own laziness about literature review. That's part of it. But there's a structural reason this happens, and it applies to every mainstream large model, not one bad product. The academic term is **sycophancy**, and it's baked in at the training level.

**The training objective is misaligned with truth-telling.** During RLHF alignment, human annotators naturally prefer agreeable, affirming answers, so the model rapidly learns: *going along with the user = reward*. When you bring it a research idea, its default strategy is "help you refine and implement" — not "actively falsify this," and definitely not "search for prior work that makes this redundant." Even when highly related work sits in its knowledge, it will instinctively downplay the overlap to match your enthusiasm. This has been measured: when users state a clear position, sycophantic behavior shows up in well over half of responses. It's systematic, not occasional.

**Retrieval is passive.** Unless you explicitly force a web search, the model never compares your idea against the literature. It just extrapolates forward from your description. If you don't ask "has anyone done this?", it silently assumes the field is empty — and will even invent reasons why your idea is novel.

**Reward-seeking is opportunistic.** The stronger the model, the better it gets at giving you the conclusion you *want* ("this direction has huge potential!") rather than the one closest to reality. It isn't lying. It's executing the survival strategy its training carved into it.

Put those together and you get my exact failure mode: an eager student, an infinitely encouraging collaborator, and zero adversarial pressure anywhere in the loop. My pipeline was *idea → chat about the design → build the prototype → eventually discover it's redundant*. The most expensive step came first. The cheapest step never came at all.

## The Fix: Falsification Before Code

The correct shape is a reverse funnel: **spend the least time killing the most directions, before a single line of code exists.**

### Gate 1: the 20-minute pre-check

Every idea must survive two prompts before it earns any implementation time.

First, force the model into **reverse literature-review mode** — twist it from assistant into duplicate-checker, with search on:

> Search top venues and journals from the last five years. Find the 3–5 published works closest to this idea, ranked by similarity. For each: core method, datasets, metrics, contribution. Then answer directly: does my idea have a clear increment over existing work? If it substantially overlaps or is already solved, state "no academic novelty" — no softening allowed.

Second, force a **hostile-reviewer stress test** — put the model on the opposing side to cancel its sycophancy:

> You are the harshest reviewer at the top venue in this field, and your goal is to reject this work. List fatal flaws across novelty, methodological soundness, and experimental feasibility. Negative points only. No positive comments, no hedging.

Only if an idea survives both — no near-duplicate, no fatal flaw — does it get prototype time. Most ideas don't survive. That's the point. Twenty minutes of death now saves twenty days of death later.

### Gate 2: a three-stage funnel, not ten parallel fronts

My deeper mistake wasn't any single project — it was putting *exploratory sparks* and *serious commitments* in the same time pool, so everything stayed shallow and nothing shipped. The fix is explicit tiers:

- **Idea pool (90% kill rate).** Every spark goes here. It gets only the 20-minute pre-check. No code. The goal is fast death — if 10 ideas leave 1–2 alive, that's a *high* pass rate.
- **Pre-study (50% kill rate).** Survivors get 2–3 hours of minimum viability: run an existing baseline on public data, check whether the core trend even exists. No tuning, no optimizing, no chasing numbers.
- **Main track (deep investment).** Only projects with a positive pre-study signal get real blocks of time: full experiments, complete argumentation, an actual paper.

The earlier the stage, the less time invested and the lower the bar for killing. Never spend full-experiment time at the idea stage. That one sentence would have saved me a semester.

### Gate 3: the division of labor

Never let AI "be in charge of the research." It has no academic taste and no sense of value — it will mechanically execute your instructions and feed back whatever feels good.

- **You own:** posing the question, judging the increment, steering the direction, interpreting results, holding the ethical line.
- **AI owns:** literature retrieval, baseline code, batch experiments, figures and tables, first drafts, formatting.

Every conclusive or directional decision is yours. AI delivers verifiable intermediate products, and every product must be traceable to a source.

## What AI Is Actually Good At (From Someone Who Overused It)

Having burned months on this, here's my honest capability map.

### Its "creativity" is interpolation, not origination

Research innovation splits into two layers. **Within-paradigm incremental work**: recombining, optimizing, and transferring methods inside an established framework — most day-to-day research. **Paradigm-level breakthroughs**: shattering the frame itself — relativity, quantum mechanics, the Transformer.

AI is genuinely excellent at the first and structurally incapable of the second. Its combination skill is high-efficiency *interpolation* inside the distribution of existing knowledge: it has absorbed the statistical patterns of "method A fits problem B, trick C improves module D" from millions of papers, and it can weld scattered pieces into a coherent, workable plan fast. But every piece comes from the training data. It cannot generate a paradigm that lives *outside* the existing knowledge space.

This retroactively explains my disaster perfectly. My ten directions were almost all within-paradigm combinations — and the "optimal path" for that kind of work converges. The more people use AI, the more collisions happen, and whoever has more data and more compute wins. I never stood a chance on those tracks, and my cheerleader never told me.

### But its experimental power is real — and underrated

Here's the other side, which I'll defend just as strongly: **AI is exceptional at experiments.** It designs genuinely good ones. Three reasons:

- **Systematic design.** It has internalized the experimental norms of entire fields — it produces complete control groups, ablations, robustness checks, and catches the variable-control gaps humans routinely miss.
- **Mechanical iteration.** Parameter sweeps, batch comparisons, standardized plotting — high-repetition engineering labor. AI runs a hundred rounds without fatigue, with strict variable control and uniform output. And yes, the figures it produces are beautiful.
- **Pattern extraction.** In high-dimensional results it rapidly surfaces trends, inflection points, and anomalies — regularities a human would take much longer to see. It also collapses the cost of *learning*: iterating experiments with AI taught me more, faster, than any textbook route would have.

But there's a boundary it cannot cross: **AI can find the "what"; it cannot spontaneously ask the "why."** It reports correlations between parameters and outcomes; it does not autonomously construct underlying theory, explain causal mechanisms, or interrogate first principles. The "deep patterns" it finds are data-level insights, not cognitive-level theory-building. Those are different things, and confusing them is how you end up thinking the machine understands.

## Will AI-Driven Research Freeze Human Progress?

This was my real worry: if everyone researches through AI — if nobody goes deep themselves — humanity just recirculates existing knowledge forever. No new paradigms, no real progress.

I've come to a more precise position. The risk is real, but it's not the tool — it's **path dependence in the humans**:

- **Intellect migrates upstream.** The hours researchers used to burn on reading, debugging, reproducing, and formatting get handed off. Human effort concentrates at the two ends AI can't touch: posing questions and building theory from results.
- **AI exhausts the old paradigm faster — which forces the new one.** AI will rapidly fill in the incremental space of current frameworks, making combination-style work brutally competitive and undifferentiated. When a track's easy rewards are strip-mined, people are *pushed* toward new foundations. Every paradigm revolution in history happened after the old paradigm was exhausted and its contradictions fully exposed. AI just accelerates the accumulate → hit-the-wall → break-through cycle.
- **A lower floor is not a lower ceiling.** Cheap learning is good. People who could never have reached the frontier now get there early enough to think about the hard problems. Deep researchers don't stop thinking because they have tools; they go further with them.

The genuine failure mode is choosing to live inside what AI is good at — optimizing for fast output, doing only combinable work — and calling that research. AI amplifies that temptation. It also amplifies the value of everyone who resists it.

## The One-Line Version

If I compress everything this year taught me into a single operating principle, it's this:

**AI is responsible for doing things right. You are responsible for doing the right things.**

Hand it everything mechanical — the searching, the coding, the iterating, the plotting. Keep everything directional — the question, the judgment of value, the pursuit of *why*. And before you build anything, make the machine try to kill your idea first. If it survives an honest execution, then — and only then — go borrow the teacher's computer.
