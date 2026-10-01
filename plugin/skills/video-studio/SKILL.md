---
name: video-studio
description: Routes any video-production request to the best installed GraviStudio engine, preserves checkpoints, uses free-first assets, and verifies the final output.
---
# GraviStudio video router

Use this skill for any request to create, edit, transform, clip, animate, caption, render, or assemble video.

## 1. Resume first
Read `.gravistudio/checkpoint.json` when present. Reuse completed planning, assets and renders. Never restart a completed stage unless its inputs changed.

## 2. Choose the route
- Product/app/repository launch video → `/product-video`, then `/brag` when available.
- Motion graphics, website-to-video, UI animation, reels from mixed assets → `/motion-graphics`, then `/hyperframes`.
- Long video or YouTube source → social shorts → `/auto-clips`.
- Documentary, explainer, researched long-form story → `/openmontage`.
- Portrait animation / live avatar → `/persona-live` only when its GPU/runtime requirements are met.
- Generic edit/merge/crop/audio/subtitles → FFmpeg directly.

## 3. Asset gap analysis
Before composition, list every required visual/audio asset. If user assets are missing or unsuitable, invoke `/asset-agent`. Do not block merely because the user supplied no images.

## 4. Production contract
Create `.gravistudio/plan.json` containing title, category, duration, aspect ratio, scenes, route, expected outputs and freeMode. Work in `input/`, `work/`, and `output/` only.

## 5. Checkpoints
After each stage update `.gravistudio/checkpoint.json` with: stage, completedStages, pendingStages, generatedFiles, selectedAssets, engine, blockers, updatedAt.

Stages: `requirements → storyboard → assets → composition → render → qc`.

## 6. Delivery
Invoke `/video-qc`. Save final media under `output/` and `output/manifest.json`. If blocked, record the missing prerequisite in the checkpoint and stop without fabricating success.
