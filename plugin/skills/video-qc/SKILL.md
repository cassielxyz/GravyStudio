---
name: video-qc
description: Verifies rendered video files with ffprobe/FFmpeg and visual sampling before GraviStudio marks a job complete.
---
# Video QC

A job is not complete until the final media exists and verification passes.

Check at minimum: readable file, non-zero duration, expected dimensions/aspect ratio, expected approximate duration, video codec, pixel format, audio stream when requested, frame rate, no obviously truncated render, and subtitle/caption presence when promised.

Use ffprobe for machine checks. Sample frames from beginning/middle/end (and scene boundaries when known) for visual inspection. Save `output/qc.json` with checks, warnings and pass/fail. Only mark completion when mandatory checks pass.
