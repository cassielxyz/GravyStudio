# GraviStudio 0.1.0 — Production Baseline

This release provides the first production-oriented local dashboard + Antigravity plugin baseline.

## Included

- Dependency-free Node 22 local dashboard/API.
- Antigravity plugin with video router, category skills, asset sourcing, QC, free-first rule and subagents.
- Initialize/Repair UI with idempotent skill verification.
- /brag and HyperFrames installation paths.
- Optional AutoClip, SupoClip, OpenMontage and PersonaLive repository setup groups.
- Product, motion graphics, website video, shorts, long-form, avatar, editing and reel workflows.
- Raw local asset upload with size/type validation.
- Openverse and Iconify asset adapters.
- Antigravity headless job runner using existing CLI authentication.
- Persistent job records and per-project checkpoint contract.
- Resume flow for failed/permission-blocked jobs.
- Localhost-only server and restrictive static security headers.
- CI syntax/structure tests.

## Verification performed for this package

- `npm run check` — passed.
- `npm test` — 4/4 passed.
- Local HTTP health endpoint — passed.
- Dashboard HTML delivery — passed.
- Category API — all 8 routes returned.
- Raw file upload endpoint — passed.
- Job creation/persistence — passed.
- Missing Antigravity CLI failure path — passed and produced a resumable explicit blocker.
- Global plugin copy script — passed.

## Runtime verification intentionally deferred to the user's machine

The actual `/brag`, HyperFrames and optional engine downloads depend on external network access and local OS prerequisites. The Initialize button performs those installs and runs a doctor pass on the target machine. PersonaLive additionally requires its upstream model/GPU setup.
