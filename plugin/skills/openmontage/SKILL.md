---
name: openmontage
description: Runs researched long-form, documentary and explainer workflows through an installed OpenMontage checkout while enforcing GraviStudio free-first and provenance rules.
---
# OpenMontage adapter

Use the OpenMontage checkout under the GraviStudio tools directory when present. Read its current AGENT_GUIDE and pipeline definitions before execution because upstream workflows can change. If dependencies are not configured, follow the installed upstream setup instructions inside that checkout after normal Antigravity permission checks.

In Free Mode, select only providers/workflows that do not require paid API calls. Prefer real/open footage and open-license assets where the pipeline supports them. Mirror important stage completion into `.gravistudio/checkpoint.json` so GraviStudio can resume even if the Antigravity conversation is interrupted.
