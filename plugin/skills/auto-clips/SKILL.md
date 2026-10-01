---
name: auto-clips
description: Turns long-form local or user-authorized video into ranked shorts/reels with transcription, speaker reframing and captions using AutoClip or SupoClip.
---
# Auto clips

Primary engine: AutoClip when `autoclip doctor` passes. SupoClip is an alternate engine when explicitly selected/available.

If the AutoClip repository is present under the GraviStudio tools directory but the `autoclip` command is unavailable, read the installed upstream README and perform its current local setup inside that checkout after normal Antigravity permission checks. Never guess stale installation commands.

- Process only content the user owns or has permission to process.
- Prefer local transcription and the signed-in Antigravity agent for semantic selection where integration permits; never upload video/audio to an LLM provider.
- Produce reviewable candidate clips before final export when practical.
- Validate 9:16 framing, caption burn-in, speaker visibility, H.264/AAC compatibility and audio loudness.
