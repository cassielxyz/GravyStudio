# Changelog

## 0.2.2

- Fixed workspace cards appearing dead when Antigravity CLI is unavailable.
- Workspace clicks now open the brief flow first and save a checkpoint before reporting a launch blocker.
- Added in-dashboard action feedback for Verify, Settings, initialization, engine installs and workspace launches.
- Added clear busy states and a CLI-not-detected readiness message instead of immediately throwing an error toast.
- Preserved the user's video brief when launch is blocked so work can resume after CLI setup.

## 0.2.1

- Reworked the extension dashboard with a cleaner shadcn-inspired design system.
- Added the transparent graffiti-style GraviStudio wordmark to the hero.
- Replaced emoji workspace icons with consistent inline SVG icons.
- Tightened sidebar spacing, cards, status treatment, buttons and responsive behavior.
- Refined the first-run Initialize Studio modal and runtime/module status UI.

## 0.2.0

- First real VSIX distribution.
- Activity Bar AI Video Studio dashboard.
- Initialize Studio and doctor/verification flow.
- Bundled Antigravity skill pack.
- Optional engine installer for Brag, HyperFrames, AutoClip, SupoClip, OpenMontage and PersonaLive.
- Free Mode and checkpoint-aware job prompts.
