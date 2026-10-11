---
title: "Everyone’s Building AI Music Factories. I Want to Build an Instrument."
description: "Music does not compile. The missing fast verification loop is why AI music feels wrong — and why the goal should be a personal, continually adapting instrument rather than a song factory."
date: 2026-09-13
updated: 2026-09-13
tags: ["AI", "music", "research", "reflection"]
---


*I use AI to write code every single day, and it feels like a tool that belongs to me. I use AI to make music, and it feels like a vending machine. Both fields run on the same technology. One feels like a workshop; the other feels like a slot machine. This essay is my attempt to explain why — and what I would build instead.*

---

## The Numbers Are Real, and the Feeling Is Empty

Let me start with what is actually true, because the hype is not wrong about the facts.

Suno v6 writes eight-minute songs and was co-trained with major labels. Mureka's O3 does reflective music reasoning — it writes a section, reviews it, revises it. ACE-Step 1.5 generates a full song on a 4GB graphics card, covers ten seconds to ten minutes, and supports reference audio, repaint, stems, and LoRA personalization. Open models like YuE, DiffRhythm 2, and HeartMuLa have closed most of the quality gap in two years. In a blind test across eight countries, 97% of nine thousand people could not tell AI music from human music.

By every metric, this is a solved problem. The sound is fine. The structure is fine. The vocals are fine.

So why does it feel so empty?

I have spent weeks trying to put my finger on this, because "it feels wrong" is not an argument. Here is the honest version: it is not that the music is bad. The music is often good. It is that **I am not in it.** I typed a sentence, I received a finished song, and I felt nothing — the same way I would feel nothing if a machine handed me a painting I had not painted.

Compare that to how I use AI to write code. That feels like *mine*. I have a vague idea, I say a little, the machine writes a scaffold, I run it, something breaks, I fix one line, it works, and then — this is the important part — I get this tiny spike of "holy shit, that actually works," and I want to keep going. Nobody hands me a finished product. I build it, badly and then less badly, one discovery at a time.

Two fields. Same underlying technology. Completely different feeling. I could not stop asking why.

The answer, I think, is one missing piece — and almost everything else about this essay follows from it.

---

## The Missing Compiler

Let me break down the AI coding loop honestly:

1. **You say what you want** — in plain language.
2. **The AI assembles context** — it reads your repo, your errors, your existing code.
3. **It generates a scaffold** — a big, low-risk pile of structure.
4. **You iterate** — change a line, rerun, see what breaks.
5. **You verify** — it compiles, it runs, the tests pass.
6. **You version it** — every step is recorded, and your toolbox accumulates.

The engine of this whole loop is steps 4 and 5 working together. And step 5 only exists because **code has a right answer.** Run it and you know. No argument, no debate, no waiting a week. The feedback is immediate, objective, and total.

Now map the same six steps onto music.

Steps 1–4 transfer almost perfectly. Hum a melody instead of describing a requirement. Feed it reference tracks and your taste instead of a repo. Iterate on one section instead of debugging. All of that works.

Step 5 has nothing to stand on. **Music does not compile.**

And I want to be precise here, because the lazy version of this argument says "music has no verification." That is false. Music has verification — it is just **distributed, delayed, and subjective.** You do not run a song and get a pass or a fail. You listen. You wait. You listen again the next morning. You send it to a friend. You try it on different speakers. Your ears lie when they are tired, and they lie differently when you are excited, and they lie most of all when you made the thing yourself and want it to be good.

The verification loop exists. It is just **slow, social, and never fully closes.**

That missing compiler — that slow, distributed, human compiler — is the entire story. Everything else in this essay is a consequence of it.

---

## The Prompt Is Not an Emotional Interface

Picture an ordinary moment.

It is late. I am walking home alone. I do not think:

> "I want a 120 BPM D-minor lo-fi hip-hop track with Rhodes and a female vocal."

I think:

> "I'm tired today."

Or:

> "I suddenly want to go back to the summer of high school."

Or:

> "I don't know why, but I want to sink into something."

None of those are music parameters. But almost every AI music system asks me to translate myself into:

```
genre
mood
tempo
instrument
voice
lyrics
style
structure
```

Here is the sharp version of the problem: **the prompt is a language interface, but emotion is not language.** A normal person can say something like "this song makes me think of riding the bus in the rain when I was a kid." That sentence contains an enormous amount of information — time, memory, emotion, body, scene, personal history, and an entire implicit aesthetic. Not one bit of it is a music parameter. And the model hears none of it.

Instead, you are handed a vocabulary you were never taught: shoegaze, sus4, lydian, sidechain, saturation, swing, voicing, crescendo. If you do not know those words, you are told you "just need a better prompt." But not knowing the words does not mean you have no taste. It means the taste was never verbal to begin with. Most musical knowledge is *bodily* and *pre-verbal* — you know what "lifts" and what "sinks," and you could not name a single chord.

So AI music did not remove the barrier to entry. It **moved** it. Before, you had to learn an instrument. Now you have to learn the vocabulary of the people who built the model. Either way, you still cannot create until you can speak a language that was not yours.

That is the first and deepest thing that is wrong, and it is not a feature gap. It is a philosophical mistake about what music is *for*.

---

## Music Is a Trajectory, Not an Object

Most systems model music like this:

$$\text{Prompt} \rightarrow \text{Song}$$

But a person's experience of music is closer to this:

$$\text{Self} \rightarrow \text{Feeling} \rightarrow \text{Expectation} \rightarrow \text{Tension} \rightarrow \text{Release} \rightarrow \text{Memory} \rightarrow \text{Feeling}'$$

Music is not a static label. It is a path. "Sad" is not a song; it is a word we use *after* the song is over. What actually happens is something like:

```
lonely
  ↓
remembering
  ↓
sinking deeper
  ↓
a familiar melody appears out of nowhere
  ↓
something opens
  ↓
release
```

"Sad piano song" is a postcard of that journey. The journey is the thing.

This is why current AI music feels like a caption: it has the *word* for the experience but none of the *movement*. Research lists exactly this as unresolved — fine-grained controllability, interference between conditions, unstable emotion-label mapping, and time-varying user intent. We have models that can generate the destination but not the road.

So the real contrast is not "bad music vs. good music." It is:

$$\text{static intention} \rightarrow \text{music}$$

versus

$$\text{evolving self} \rightarrow \text{evolving music}$$

Those are not points on the same line. They are two different products.

---

## Why the Factories Make Average Music

Now we can explain the thing that actually bothers me: not that AI music is bad, but that it is so consistently *forgettable*. Correct, polished, and completely without a spine.

It is a direct consequence of the missing compiler.

When you cannot verify quickly, the only rational move is to outsource the decision to the safest possible thing: the hook, the pop formula, the structure that has worked ten thousand times. This is not a moral failure of the companies. It is the only sensible strategy when your objective is "a song most people won't skip." No fast verifier means you optimize for the average. The average is safe. The average is boring.

That is why generated music so often nails the assignment while meaning nothing. It was never asked to mean anything. It was asked not to be skipped.

And it gets worse, because the evaluators themselves are broken in a measurable way. The 2026 ICASSP ASAE challenge showed that current models are terrible at distinguishing truly top-tier songs from merely good ones. This matters more than it sounds, because **reward learning lives exactly in that top range.** If your judge cannot tell "great" from "fine," then training against that judge nudges the generator toward "average good" and never toward "great." You get a system that is optimized to be indistinguishable from acceptable.

There is a second failure, subtler and sadder: **static evaluators go stale.** The generator keeps improving; the evaluator keeps scoring the old distribution. The reward signal drifts out of touch, so the model chases a target that no longer corresponds to anything. It is a treadmill pretending to be progress.

Put together, the standard recipe is:

```
static critic  +  static reward  +  no fast verification
        ↓
      average good
```

The field has spent enormous effort making the generator stronger. Almost nobody has spent the same energy on the *ear*.

---

## The Thing I Could Not Stop Thinking About: EarLoop

If the missing piece is verification, then the research problem is obvious, and slightly strange: **build a verifier for taste.**

The naive version is broken for the reasons above. So here is the idea that I keep coming back to. Instead of treating the ear as an external, frozen judge, let it be something that **grows with the generator.** I call it **EarLoop**:

- The critic does not just output a score of 6.5. It says *"0:42–0:58, the chorus energy collapses"* — a **located** criticism, not a number.
- The generator regenerates only the flagged section. Not the whole song — the sixteen seconds that were wrong.
- Then the critic scores again, and the two iterate together, each one sharpening the other.

This mirrors how actual producers work. Nobody writes a song in one shot. You listen, you change one part, you listen again — often the next morning, because your ears lie when they are tired.

There is a real distinction hiding here. A score is a **grade**. A location is a **note from a teacher.** Grades tell you how wrong you are; notes tell you where to look. The entire field is currently training on grades.

But there is a trap, and I want to name it before someone builds the obvious broken thing. If the critic and the generator evolve together with no anchor, they can **collude**. They can drift into a private language of "good" that has nothing to do with human taste — the generator learns to please the critic, the critic learns to reward what the generator makes, and the loop spirals into a beautiful, self-consistent, meaningless equilibrium.

The fix is to anchor the loop in **real human signals** — not just preference ratings, but behavior. What do people replay? What do they skip? What do they export and finish? What do they come back to the next day? What do they hum along to? Those are slow, noisy, and hard to collect. They are also the only things that are true.

The ear has to grow with you. But it also has to stay honest.

---

## Stop Calling It a Generator

The name "AI Music Generator" already limits the thing. What I want is not a generator. It is a **Personal Musical Instrument**.

Not "tell the AI what you want to hear," but:

> **You do a tiny thing, and the music answers you.**

Imagine opening the system and there is no genre dropdown, no tempo field, no key selector, no prompt box. Just one question:

> **"How do you feel right now?"**

You type: "A little annoyed."

It does not generate a finished song. It gives you twenty seconds: low, sparse, no drums, one harmony repeating with slight variation.

You: "Too dark."

One click — **"Brighter."** It changes immediately.

You: "This one feels a bit like me."

It remembers. Next time, you do not have to explain. Because it has started to build:

$$\text{your music state space}$$

Notice what happened. The interface is not a better prompt box. It is a **sequence of tiny, non-verbal choices**, each one cheap enough that you can make it without knowing a single musical term. The system does the translation; you just react. That is the difference between being asked to *describe* yourself and being allowed to *recognize* yourself.

And the input should not be a text box at all. A genuinely zero-barrier system should accept:

- **Words:** "I want to disappear for a while today."
- **Sound:** you hum — "hmm—hmm—hmm…"
- **Body:** you are walking; it hears the rhythm of your pace.
- **Environment:** the mic hears rain, a subway, a room, the sea.
- **Image:** you photograph an evening street.
- **Memory:** "this reminds me of being little."
- **Silence:** you say nothing at all.

All of these are $\text{human state}$, not $\text{music prompt}$.

And I think **humming may matter more than prompting.** Ordinary people constantly have musical intention without musical language. You hum *la—la—la* and you have no idea what notes they are — but the hum already contains contour, rhythm, tension, phrase, and emotion. The mistake is to treat the hum as "input audio" to be transcribed into MIDI. It is not. It is the **intention you did not know how to say.** Transcription throws away the thing that matters. Those are two completely different interpretations of the same five seconds, and the second one is the entire product.

---

## What Music Actually Is: A Landscape, Not a Label

Here is where the design starts to have a shape, and where an intuition I had been circling for a while finally clicked.

I used to think of taste as a list of genres. It is not. It is a **landscape with basins**:

```
              /\                 /\
             /  \      ___      /  \
    ____ ___/    \____/   \____/    \____
         ↑             ↑
      walking        a sound
      at night       I can't name
```

The basins are not genres. One of them might be *"the music I listen to when I'm walking alone at night."* That single basin quietly contains a tempo, a sense of space, a harmony, how far away the vocal sits, a dynamic range, how sparse the drums are, how dense the melody is, how fast the emotion changes. The person who owns that basin cannot explain any of it — and that is the point. It is a region, not a word.

I have a slightly reckless intuition about why this shape keeps showing up: a bunch of waves added together *makes* a landscape. Different frequencies make different scales of structure; where they reinforce, you get peaks; where they cancel, you get valleys. I do not think basin is literally Fourier — I am not going to pretend the math is the same — but the *shape* is the same shape. Complex taste is not a point on a list; it is the sum of many periodic, interacting preferences, and the interesting things happen in the low places where several of them agree.

If that is right, then two design consequences follow.

**One: a sample is not "in a basin," it sits in the overlap of several.** So instead of hard clustering — this belongs to genre 7 — you want a soft routing: the music is simultaneously a little of this basin and a little of that one. That is also truer to how people actually listen. Nobody is in exactly one mood.

**Two: new taste does not require rewriting old taste.** This is the seed of everything I care about research-wise. When a new distribution arrives, you do not have to retrain the whole function. You can add a new local structure:

$$E(z) = E_{\text{old}}(z) + \lambda\, E_{\text{new}}(z)$$

and keep the old landscape mostly intact. **Incremental landscape construction**, rather than continuously overwriting a global model. I will come back to why this is the hard problem and the interesting one.

---

## Stop Handing Me Songs. Hand Me Material.

There is a number I keep noticing: the thing that excites a person is often seven seconds long.

```
0:00  kick
0:01     kick
0:02  kick-kick
0:03      ─────
0:04  a strange timbre enters
0:05      ↓
0:06  the rhythm flips
```

You hear that and think: *"I want to play with this."* You do not need a song. You need the groove.

Real composition does not start with structure. It starts with **material** — a melody you hummed in the shower, a drum pattern you stumbled into while testing a sample pack, a chord that surprised you. Structure — verse, chorus, bridge — is *discovered afterward*, by listening back to what you accidentally made. Every producer who has ever stacked four bars of drums before knowing what the song is about already knows this.

This is exactly where AI music has it backwards. Every platform wants to hand you a finished song. Almost nobody wants to hand you a **great four bars** and let you play.

And there is a hard usability reason as well as a philosophical one: **your feedback on a three-minute song is almost worthless.** You cannot tell what you liked; it is too much at once, too quickly, and your memory of the beginning is already contaminated by the end. The loop below is not just more fun. It is the only structure in which your feedback is actually informative:

```
you
 ↓
5 seconds
 ↓
listen
 ↓
"this part, I like"
 ↓
system understands
 ↓
continue
 ↓
10 seconds
 ↓
change
 ↓
continue
```

**Music as interaction**, not music as generation. That is the shift. The first real AI music product will not be a better song generator. It will be a better **supplier of material.**

---

## AI Should Be a Collaborator, Not a Composer

This is a philosophical shift, not a feature, and it changes everything about how you evaluate the system.

Traditional AI music: **AI = composer, you = customer.**

What I want: **AI = collaborator / instrument.** You are the creator. It keeps handing you:

```
possibility
possibility
possibility
```

and your job is: "This one." "No, this one." "Wait — combine the two." The music grows out of your choices.

Which means randomness matters, but not the randomness you think. If AI executes exactly what you ask, it gets boring almost immediately — you already knew what you wanted. Blind noise is not the answer either; it is just irritating. What is worth having is:

$$AI = \text{Intent} + \text{Controlled Surprise}$$

Specifically: **surprise plus coherence.** "I did not expect this, but I immediately understand why it is good." That is the feeling. It is not "AI did it for me." It is "**I found this.**"

If you have used a good coding assistant, you know the exact feeling. Copilot's magic was never "write my whole project." It was: you write a little, it offers you a possibility you would not have typed, and then you own it. Music can work the same way:

> You tap a rhythm. It becomes a groove. "What if the last hit came a little early?" It changes. "Switch that sound to those dirty electronic drums." It changes. "Leave the first two bars empty." It changes. And then a groove appears that **you did not plan** — and you get excited.

Then: lock the groove, grow a bass on top, thin it out, change the third beat. An idea grows instead of being delivered.

This is not "a better Suno." This is a **music IDE.**

---

## The Journey: From Moments to a Personal Space

Now put the loop on a calendar, and something qualitatively different appears.

**Day one.** "I just want to hear something." The system gives a few sounds. You point: "That one."

**Day two.** "The feeling from yesterday." The system already knows which basin.

**Day three.** "A little lonelier today." The system moves along the basin:

$$B_{\text{yesterday}} \rightarrow B_{\text{today}}$$

**A month later.** This person has $\mathcal{M}_{user}$ — a personal music space, built entirely out of choices they could not have articulated.

This is where continual learning stops being an academic word and becomes the actual mechanism:

$$\theta_{global} + M_{user}(t) \rightarrow music_t$$

where $\theta_{global}$ is the general musical ability the model already has, and $M_{user}(t)$ is this one person's constantly changing musical memory:

$$M_{user}(t+1) = \text{Update}\big(M_{user}(t), \text{interaction}_t\big)$$

And here is the part I find genuinely beautiful, not just useful: **forgetting becomes a feature.**

A person's taste is not fixed. What you loved at seventeen is not what you love at twenty. So the system must *not* "always remember what you like." It has to hold:

$$\text{memory} = \text{stable preferences} + \text{temporary states}$$

Long-term basins ("I love sound with a lot of space"), short-term basins ("this week I want something heavy"), and transient states ("right now I am excited"). A system that only stores a fixed user embedding is wrong about human beings. A system that can *let things fade* is closer to a friend.

And now the key move, the one that makes this a research problem instead of a product feature. What should the system remember?

Not "this user likes rock."

> **"This person just found surprise in this region of the music space."**

Remember $\text{Discovery}_t$, then keep exploring around it. That is exactly the basin idea: not shoving the user into an interest label, but walking with them through a landscape, looking for the places where they go "oh, this is interesting." The target is not preference. It is **discovery under preference.**

---

## The Research Question Underneath (and Why It Is Hard)

If what I have described is right, then the object of study is not a model. It is a process:

> **How does a personal music representation form, stabilize, differentiate, and forget, under a long, task-free, non-stationary stream of real interactions?**

That is a continual-learning problem, and it is a far better fit for me than "train another music backbone." The model is increasingly a commodity — that floor keeps rising and the work is crowded. The interesting part is that a machine has to learn *your* particular taste instead of the average of everyone's, and it has to do it live, without task boundaries, without forgetting the things you still love, and without letting one new obsession quietly contaminate everything else.

Let me be careful, though, because there is a trap on this side too. It is very tempting to call everything "continual learning." It is not. Personalization is not CL. Machine unlearning is not CL. Long-context generation is not CL. These are different problems that share vocabulary and sometimes share math. If you are not precise, you end up with a grant proposal that says "CL solves model iteration, personalization, copyright, long audio, and unified models," which is not a claim; it is a list of wishes. So let me state the actual measurable quantities, because they are what make it science:

- **Adaptation** — can it take on the new thing quickly?
- **Retention** — does the old thing survive? (This is the real catastrophic forgetting.)
- **Interference** — does learning B quietly move A?
- **Isolation** — can you remove one thing without touching the others?

Those four are the whole game, and notice that they are exactly the four things the missing compiler makes hard to measure.

Which leads to the deeper diagnosis, and the sharpest sentence I can write about this field:

> **Generative audio does not have a mechanism problem. It has a measurement problem.**

In image classification, "forgetting" is operationally clean: you report accuracy on old tasks and watch it drop. In generative audio, the sentence "the model forgot artist X's style" has **no accepted operationalization.** The common proxies all fail in different directions. Fréchet-style distances are noisy, scale-dependent, reference-set-dependent, and biased upward at small sample sizes — two cells with different sample counts are not even comparable. Prompt-alignment scores measure prompt adherence, not retention: a model that perfectly matches the text while destroying the old style will score *better*. Memorization probes measure the opposite failure — a generator that has started regurgitating its training data scores *well* on naive retention metrics. And none of it establishes that the change a metric detects is a change a listener would ever notice.

The practical consequence is that a generative-CL result is easy to produce and hard to falsify. The estimator will always return a number. Nothing in the standard workflow tells you whether that number is signal. (I know this firsthand — I have been building the measurement apparatus before running the experiment, and it has already caught bugs that would have produced perfectly reproducible, completely wrong results. A metric that repeats is not the same as a metric that is true.)

And this is why the copyright pitch — the one every VC loves — has to be handled with care. It is tempting to say: continual learning plus machine unlearning means we can surgically delete infringing memories at a fraction of the cost of retraining. That is far too strong. Unlearning and continual learning actually pull in **opposite directions**: CL wants to absorb new knowledge while keeping old knowledge; unlearning wants to delete specific old knowledge while keeping the rest. They share tools — parameter intervention, knowledge localization — but conflating them is a category error, and the first text-to-music unlearning paper found the standard methods substantially damage the retained set while only partially suppressing the target. A better, *provable* goal is available: put adaptation in a removable component, and you can measure deletion fidelity, cross-user interference, and residual leakage exactly. That reframes a hard epistemic problem as an engineering property you can certify. Fewer promises, more truth.

So the sequencing matters. Before you train anything, you build the instrument. Before you claim a mechanism, you prove you can recover an effect you deliberately injected. This is not glamorous, and it is the reason the field keeps producing results nobody can trust.

---

## The Part That Is Probably Too Weird to Work (Yet)

Underneath all of this is a question I cannot put down.

What if the right way to describe music to a machine is not text, and not notes, and not audio tokens?

Text is a translation, and translation loses things. I have hummed a melody I could not describe in words — not because my vocabulary failed, but because the thing **is not verbal.** MIDI is the written language of music theory, but theory is what we use to *talk about* music after the fact; it is not how the music appears in your head. And audio tokens only capture what a sound *looks like* — they are a photograph of a waveform, not a direction.

I think the real unit is **movement.**

When a chorus "lifts," when a bridge "sinks," when a riff "has a certain drive" — you feel that in your body. Music cognition calls this embodied cognition, and it is not a metaphor; it is closer to how we actually process it. What if we built an AI on that level, on little gestures — a few seconds each — described not by names but by a small set of continuous curves?

- **Energy arc** — how intensity swells, drops, pulses.
- **Rhythmic fingerprint** — the pattern of long and short, with pitch stripped away.
- **Interval vector** — the direction and size of pitch movement.
- **Timbre trajectory** — how brightness shifts over time.

I call these **gestures** — not discrete tokens but a continuous field, where distance means "these feel like the same kind of motion." Then "understanding" your hum does not mean transcribing it into words. It means catching the **direction and force** of your movement, and generating something that moves the same way.

It might be too hard to build. Extracting gestures from raw audio is one problem. Generating in that space is another. And quantifying tension and release — which is what actually makes music work — is a third that nobody has really cracked.

But it is the only framing I have found where a machine could learn *your* taste instead of the average of everyone's, and where the "prompt" could be replaced by a gesture you made with your body before you had words for it.

---

## What I Would Actually Build (Version Zero)

Not a text-to-music box. An **exploration loop**:

$$\boxed{ \text{Explore} \rightarrow \text{Discover} \rightarrow \text{Select} \rightarrow \text{Transform} \rightarrow \text{Explore again} }$$

Concretely, version zero is deliberately, almost rudely small — **5 to 15 second fragments**, not songs:

1. You hum. It gives you six versions.
2. You pick one. It explores that groove — eight variations.
3. You find one that makes you go "this rhythm is great." You **lock** it.
4. "Grow a bass on top." Eight bass lines. You pick the fourth.
5. "But less busy." Four sparser variations.
6. Hours pass. You forgot you were "just trying it out."

That last line is the whole point. That is what "immersed in music, enjoying myself" actually is.

There is a hard engineering constraint hiding in that experience, and it decides whether this works at all: **latency.** For the loop to feel like play rather than batch processing, each step has to return before your attention wanders — a few hundred milliseconds, not a few seconds. And if each step offers six to eight candidates, you have to produce all of them in that window. That constraint alone reshapes the architecture: you generate at the level of tokens or latents and render lazily, or you pre-generate a neighbourhood and retrieve from it. The engineering answer is not obvious; the latency measurement decides it.

There is also a conceptual vocabulary I should borrow instead of reinventing, because people solved parts of this twenty years ago and again in the last ten: quality-diversity search keeps an archive of locally optimal but *behaviourally distinct* candidates, and novelty as an objective in its own right is long-established. The words "archive," "coverage," and "quality-diversity score" already exist. Use them. The new part is putting that archive inside a personal, continually adapting landscape — and measuring it on human time scales.

And note the goal is *not* "let non-musicians make music." That framing is slightly wrong. It is more precise to say:

> **Give people the musician's experience of exploration, without requiring the musician's skills.**

A musician's joy was never "I know what a chord is." It was "I just found something." AI can make the **cost of discovery** almost zero. That is a completely different target from generation quality, and crucially, the human-factors evidence points the same way: people's sense of ownership tracks how much *evaluative work* they do, not how convenient the tool is. Automation that removes the work is not experienced as help; it quietly removes the authorship. So the system must deliberately **not** do the whole job for you. It should stop at "here are three interesting directions," and let you drive.

Which means the metrics have to change too. If the final paper reports only a Fréchet distance, we have drifted back into generation. The things that actually matter here look like:

- **Discovery Rate** — how often a candidate makes you want to explore further.
- **Surprise Acceptance** — "I did not expect this, but I love it."
- **Exploration Depth** — how many layers you follow one idea down.
- **Creative Agency** — do you feel the thing is *yours*?
- **Discovery Latency** — how long from opening the app to the first "oh, this is interesting."

That last one might be the truest number in the entire project. Not how good the music is. How fast a person who knows nothing about music finds something that feels like theirs.

---

## The Honest Part

Three things, because I hate reading research hype and I do not want to write it.

First, the technical stuff might not work at the scale I am imagining. Gesture extraction, personal landscapes, co-evolving critics, real-time generation — any one of them could collapse into a two-page paper that says "we tried, and here is the boundary." Honestly, that would still be worth publishing. Negative results are useful, and I have written one before.

Second, and more uncomfortable: **personal tools do not scale as businesses.** That is the exact tradeoff that made coding AI feel personal and music AI feel industrial. A tool tuned to one person's taste is worth everything to that person and almost nothing to a venture fund. So the money keeps flowing to the factories, and the factories keep optimizing for the average, and I keep being handed songs I feel nothing about.

Third, there is a cultural risk I have not solved. If everyone uses the same default taste model, music diversity collapses. Personalization is not a feature to be added at the end. It is a survival requirement for the entire category. A world with one average taste is a world with one average song, repeated forever.

But I keep coming back to the same conclusion. The question everyone is asking — *"can AI make a hit song?"* — is boring, because it is already answered and nobody feels anything about the answer. The interesting question is:

> **Can AI turn music creation from a skill-constrained production task into an open-ended exploration loop?**

**Can it learn the shape of your particular taste, and get a little more like you every time you use it?**

In one line, what I think is actually missing is:

$$\boxed{ \text{Human experience} \rightarrow \text{Personal landscape} \rightarrow \text{Continual adaptation} \rightarrow \text{Music} }$$

instead of

$$\boxed{ \text{Prompt} \rightarrow \text{Generate} }$$

The first is an instrument. The second is a vending machine.

And I would rather have an instrument that is 60% as good but 100% mine.

---

*Background reading: the 2026 AI music landscape is moving fast — Suno v6, Mureka's reasoning-based O3, Google's real-time Lyria, and the open-source wave of YuE, ACE-Step, DiffRhythm, and HeartMuLa. Most of the numbers above come from model papers and the ICASSP 2026 ASAE challenge. The EarLoop and gesture ideas are mine, and still mostly fiction. The observation that material comes before structure is not original to me — every producer who has ever stacked four bars of drums before knowing what the song is about already knows it.*
