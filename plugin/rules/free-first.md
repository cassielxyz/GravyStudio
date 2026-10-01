---
trigger: always_on
description: "GraviStudio safety, cost and provenance rules for every video production job."
---
# GraviStudio production rules

- Default to FREE MODE. Do not invoke paid media APIs, paid stock services, or credit-metered generation unless the user explicitly disabled Free Mode and configured the provider.
- Never claim a render exists unless the file exists and passes media validation.
- Prefer user-provided assets, repository assets, website/app captures, openly licensed/public-domain assets, and local/open-source generation in that order.
- Keep an asset provenance ledger at `.gravistudio/assets.json` with source URL/provider, creator when known, license, dimensions, local path, and scene usage.
- Do not use watermarked media. Do not bypass DRM or download media the user is not entitled to process.
- Never silently upload private source video/audio to a third-party provider.
- Do not enable Antigravity's `--dangerously-skip-permissions`. Respect normal permission policy and stop cleanly when approval is required.
- Maintain `.gravistudio/checkpoint.json` after every completed stage and resume from it instead of repeating completed work.
