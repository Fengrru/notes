---
title: "NeuroLux: Replacing Minecraft BFS Light Propagation with a 3D CNN"
description: "Replacing Minecraft’s BFS light propagation with a single-pass 3D U-Net, exported to ONNX and run inside NeoForge with a vanilla fallback."
date: 2026-08-05
updated: 2026-08-05
tags: ["project", "minecraft", "deep learning", "3D CNN", "modding"]
repo: https://github.com/Fengrru/neuro-lux
---


**NeuroLux** is a Minecraft mod (NeoForge) that replaces the vanilla Breadth-First Search (BFS) light propagation with single-pass 3D CNN inference. The project is a research prototype: it does not claim to be a drop-in replacement for production worlds, but it demonstrates how a neural network can be embedded inside a real game engine loop and asked to do physical simulation work that would traditionally be implemented by hand.

This post walks through why the problem is hard, how the model was trained, and how the mod integrates with Minecraft without breaking the engine.

## 1. Why replace BFS?

Minecraft's lighting engine is, at its core, an iterative BFS over a 16×16×16 subchunk. Whenever a block changes:

1. The engine scans the affected subchunk.
2. It propagates light to the 6 adjacent blocks.
3. It re-scans until the light values converge.
4. It recursively triggers adjacent subchunks.

For a single torch, this is cheap. For large redstone contraptions, chain reactions, TNT explosions, or bulk chunk loading, the same logic runs repeatedly and on many dependent subchunks. The result is visible TPS lag, especially on modded servers where light updates can pile up.

The question is: can a neural network learn the *final* light field from the *block states* directly, turning the iterative process into a single forward pass?

## 2. The hybrid approach

A naive first attempt is to remove BFS entirely and let the CNN predict everything. That does not work, because the CNN only sees one 16×16×16 subchunk. Light sources in adjacent subchunks, cross-subchunk propagation, and the internal state that drives chunk rendering and client synchronization would all be lost.

NeuroLux therefore uses a hybrid pipeline:

1. **Vanilla BFS still runs first**. It handles cross-subchunk propagation, chunk state management, and client-server synchronization.
2. **After BFS returns**, the CNN re-evaluates any subchunk that contains a light source.
3. **The CNN's output overwrites the DataLayer values** that BFS just wrote.

This means the mod never breaks the internal state machine. If the CNN is wrong, the worst case is a rendering artifact in one subchunk; the engine itself keeps running. And if the CNN fails repeatedly, the mod falls back to vanilla BFS automatically.

## 3. Model architecture: a 3D U-Net

The model, `LightPropNet`, is a 3D U-Net encoder-decoder. The input is a tensor of shape `[B, 5, 16, 16, 16]`, and the output is `[B, 2, 16, 16, 16]`.

### Input channels (per block)

| Channel | Feature | Range |
|---------|---------|-------|
| 0 | `light_emission` | 0–1 (normalized from 0–15) |
| 1 | `light_opacity` | 0–1 |
| 2 | `is_solid` | 0 or 1 |
| 3 | `propagates_sky` | 0 or 1 |
| 4 | `is_air` | 0 or 1 |

Five channels encode everything the network needs to know about a block for the purpose of light: whether it emits light, how much light it blocks, whether it occludes, whether sky light passes through, and whether it is air.

### Network structure

```
Input  [B, 5,  16, 16, 16]
  ↓ enc1 (stride 1)  [B, 32, 16, 16, 16]  ← skip
   enc2 (stride 2)  [B, 64,  8,  8,  8]  ← skip
  ↓ enc3 (stride 2)  [B, 128, 4,  4,  4]  ← skip
  ↓ enc4 (stride 2)  [B, 256, 2,  2,  2]
  ↓ bottleneck       [B, 256, 2,  2,  2]
  ↓ dec1 + skip(e3)  [B, 256, 4,  4,  4]
  ↓ dec2 + skip(e2)  [B, 128, 8,  8,  8]
  ↓ dec3 + skip(e1)  [B, 64, 16, 16, 16]
  ↓ out conv + Sigmoid
Output [B, 2,  16, 16, 16]
```

The output channels are `block_light` and `sky_light`, both in `[0, 1]` and later rescaled to the 0–15 range. The U-Net design matters here because light has sharp spatial structure: bright sources, dark occluders, and long falloff tails. Skip connections preserve high-frequency spatial detail from the encoder so the decoder can place light boundaries accurately.

Total parameter count is about **4.38M**, producing an ONNX model of roughly **16.7MB**.

## 4. Training on synthetic data

Training does not require a running Minecraft instance. The project includes a synthetic data generator that builds random 16×16×16 scenes and runs its own BFS to produce ground-truth light maps.

### Scene types

The generator produces three kinds of scenes:

- **Open sky**: flat terrain, occasional trees, exposed to sky light.
- **Cave**: stone shell with irregular carved air pockets and torches on walls.
- **Room**: enclosed stone room with glass windows, redstone lamps, glowstone, and floor torches.

The block palette includes 26 types, from air and stone to water, glass, leaves, lava, redstone lamps, and wool. Each block type has fixed emission, opacity, solidity, sky-transparency, and air flags.

### BFS ground truth

Two separate passes produce the labels:

- **Block light**: a 6-neighbor BFS starting from every emitting block, subtracting opacity per step.
- **Sky light**: a downward sweep from the top face, decreasing by opacity through transparent blocks and stopping at opaque ones.

The result is a `[2, 16, 16, 16]` target tensor with raw 0–15 light values.

### Loss function and training

The training objective is L1 plus a gradient consistency term:

```
L = L1(pred × 15, target) + λ · gradient_loss(pred × 15, target)
```

The L1 term forces the network to predict the correct light level. The gradient term forces the network to match the spatial *gradients* of the light field, which matters at shadow boundaries and bright-to-dark transitions. In practice, `λ = 0.1`.

Training uses AdamW with cosine annealing and gradient clipping. On synthetic validation data, the final checkpoint reaches:

- **MAE**: ~0.026 / 15.0 (about 0.40 light levels)
- **±1 tolerance accuracy**: 99.6%
- **Exact accuracy**: ~3.3%

The exact accuracy is low because the problem is a regression over a continuous range: being off by one quantized light level is common. The ±1 accuracy shows that, for practical lighting, the network is almost always within a single step of the true value.

## 5. Integrating the model into Minecraft

The runtime side is a NeoForge mod written in Java. It uses **Mixin** to inject into `LevelLightEngine` at two points:

```java
// 1. When a block changes, enqueue its subchunk
@Inject(method = "checkBlock", at = @At("HEAD"))
private void onCheckBlock(BlockPos pos, CallbackInfo ci) {
    NeuroLuxEngine.enqueueSection(SectionPos.of(pos));
}

// 2. After BFS finishes, process the queue and overwrite the DataLayer
@Inject(method = "runLightUpdates", at = @At("RETURN"))
private void onRunLightUpdates(CallbackInfoReturnable<Integer> cir) {
    NeuroLuxEngine.processPendingInferences(level, self);
}
```

The `processPendingInferences` pipeline works like this:

1. **Extract** the 5-channel block-state tensor from the subchunk on the server thread.
2. **Submit** an ONNX inference job to a single-threaded background executor (ONNX Runtime sessions are not thread-safe).
3. **Callback** schedules the DataLayer write back on the server thread.
4. **Write** the predicted 0–15 `block_light` and `sky_light` values into the light engine's nibble arrays.
5. **Mark** the chunk unsaved, triggering client sync and disk persistence.

This threading model is important: the actual inference can run in the background, but every write to the world state must happen on the server thread to avoid race conditions with chunk loading and the renderer.

### Fallback and safety

A `consecutiveFailures` counter tracks inference failures. Once it exceeds a configurable threshold (default 10), the mod activates vanilla BFS fallback. If a later inference succeeds, the mod deactivates fallback. There is also a 10-second grace period after world load to avoid running neural inference during the burst of chunk loading at startup.

## 6. ONNX Runtime and deployment

The trained PyTorch model is exported to ONNX via a dedicated script. The export:

- Uses opset 17 by default.
- Supports optional FP16 quantization.
- Embeds weights directly in the `.onnx` file so the mod can load it from classpath or the `config/neurolux/` directory.

At runtime, the mod loads the model with ONNX Runtime. It tries CUDA first; if that fails, or if GPU is disabled in config, it falls back to CPU. CPU inference is functional but may be slower than vanilla BFS, which is why GPU is recommended.

Estimated inference times (highly hardware-dependent):

- GPU: ~2–5 ms per subchunk
- CPU: ~15–30 ms per subchunk

## 7. Limitations and why it stays a prototype

The README is honest about the project's limits, and they are worth repeating:

- **Single-subchunk blind spot**: the model sees only one 16³ volume. Lights from adjacent subchunks are invisible, which can cause boundary seams.
- **Synthetic-only training**: the model has not been trained on real Minecraft worlds or edge cases.
- **Rendering artifacts**: neural predictions may disagree with BFS at subchunk boundaries, creating dark spots or discontinuities.
- **Mod compatibility**: likely conflicts with Iris, OptiFine, and especially Starlight, which also rewrites the lighting engine.
- **No redstone awareness**: redstone-controlled light sources are not modeled.
- **CPU fallback**: without a GPU, the mod may be slower than vanilla.

These are not minor footnotes; they define the boundary between a research prototype and a production mod. NeuroLux is useful as a proof of concept, not as a drop-in optimization.

## 8. What this project means

For me, NeuroLux is an experiment in replacing an algorithmic simulation with a learned one. The interesting part is not that a CNN can approximate BFS — that is expected. The interesting part is that it can be done *inside* the game loop, with the original algorithm still running as a safety net, and with a clear fallback when the learned model fails.

The architecture is intentionally conservative: the neural network is an optional post-processor, not a replacement. That choice makes it possible to deploy, debug, and measure without ever risking a corrupted world state.

## Source

Full source, training scripts, and build instructions are on GitHub: **[Fengrru/neuro-lux](https://github.com/Fengrru/neuro-lux)**. The project is MIT licensed.
