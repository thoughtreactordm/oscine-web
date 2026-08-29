---
taskId: 01M17HNT2PD632FGMKRJQGGSPV
title: Drift fixes (§6) + American spelling sweep + descriptions
status: todo
priority: medium
labels:
  - polish
workstream: W4
workstreamId: W4-1
workstreamDependsOn:
  - W2
  - W3
effort: low
order: 15
created: '2026-08-29T19:59:18.613Z'
updated: '2026-08-29T19:59:18.613Z'
---
Spec: `docs/1.0-site-release.md` §6 drift list and §2 spelling rule. Run after the page and article cards land so the sweep covers the new content too.

- Grep the whole of `src/` for British spellings (colour, customis-, catalogue, favourite, organis-, licence-as-noun, grey where "gray" is meant in prose — the fictional album "A Catalogue of Absences" keeps its title) and fix them.
- Walk §6 and close every bullet not already handled by another card; tick them off in the doc.
- Footer/Home CTA lines still true? ("Free, no account", "Free for Windows and Linux".)
- Confirm `release.ts` fallback is 1.0.0 (Download card) and the header nav matches §3.

**Acceptance**: `grep -riE "colour|customis|favourite|organis" src` returns only the album title; §6 bullets all struck through with a commit reference.
