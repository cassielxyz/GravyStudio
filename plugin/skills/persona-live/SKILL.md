---
name: persona-live
description: Experimental adapter for PersonaLive portrait animation with explicit hardware/runtime checks and no fabricated fallback output.
---
# PersonaLive adapter

This route is experimental and GPU-heavy.

1. Verify the installed PersonaLive checkout and its current upstream README.
2. Verify Python environment, model weights and compatible GPU before starting.
3. Require a user-provided or user-authorized portrait and driving source. Do not source a real person's portrait from the web to animate without user direction.
4. If hardware/weights are unavailable, record the blocker in the checkpoint and offer another video route rather than pretending the avatar was rendered.
5. Keep generated media local unless the user explicitly configures another provider.
