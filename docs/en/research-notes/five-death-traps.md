---
title: "5 Death Traps I Learned the Hard Way"
description: "Five traps I walked into during a summer of research: paradigm purity for its own sake, low-dimensional toy experiments, global energy functions, fine-tuning as continual learning, and biological plausibility."
date: 2026-08-18
updated: 2026-08-18
tags: ["AI", "research", "lessons learned", "continual learning"]
---


This summer broke me. I built a lot, failed more, and came out the other side with five hard-learned lessons. These are the traps I walked into, dug myself deeper, and finally crawled out of.

---

**1. Don't chase paradigm purity for its own sake.**

I spent too long trying to build something that uses zero Transformers, zero backpropagation. That's not the point. The real breakthrough is how memory and reasoning work, not replacing every component just to feel original. Using a Transformer as the backbone is fine. Stop pretending it isn't.

**2. Stop trusting low-dimensional toy experiments.**

Basin isolation, energy landscapes, zero forgetting — everything looks perfect in 2D. In 512+ dimensions, it all falls apart. If you haven't tested it in real embedding space, it's decoration, not science. Low-dimensional results belong in the introduction and nowhere else.

**3. Never use global energy functions with softmin readout.**

DP-ProtOn killed this idea for me. In high dimensions, distances concentrate. Energy gaps shrink to zero. Softmin becomes uniform no matter what temperature you pick. Use local matching, kernel density, nearest neighbors. Anything that stays local.

**4. Stop fine-tuning weights and calling it continual learning.**

Twenty years of research, 90% of it boils down to "how do we modify weights less." But distributed storage has mathematical limits. No regularization trick or replay algorithm changes that. You're optimizing inside a box that's already proven to have a ceiling.

**5. Stop worshipping biological plausibility.**

Spike timing, Hebbian learning, continuous dynamics — biologically beautiful, computationally useless on a GPU. Intelligence is about information processing logic, not replicating wetware. If it doesn't scale to high dimensions on real hardware, it's engineering poetry, not engineering.

---

That's it. Five traps, five lessons, one brutal summer. If you're just starting out, maybe you can skip the part where I wasted a year figuring this out.
