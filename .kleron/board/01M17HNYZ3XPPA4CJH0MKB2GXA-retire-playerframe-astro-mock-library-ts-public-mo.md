---
taskId: 01M17HNYZ3XPPA4CJH0MKB2GXA
title: 'Retire PlayerFrame.astro, mock-library.ts, public/mock-library'
status: todo
priority: low
labels:
  - polish
  - cleanup
workstream: W4
workstreamId: W4-2
workstreamDependsOn:
  - W2
effort: low
order: 16
created: '2026-08-29T19:59:23.619Z'
updated: '2026-08-29T19:59:23.619Z'
---
Once Home no longer renders the CSS-drawn player (§3.1 "Remove"), delete `src/components/PlayerFrame.astro`, `src/data/mock-library.ts`, and `public/mock-library/`. The fixture names already live in `tools/capture/library.json` and the six credited covers in `tools/capture/covers/` with `CREDITS.txt`, so nothing is lost.

- `grep -r "mock-library\|PlayerFrame" src astro.config.ts` must come back empty before deleting.
- Rebuild; check no page references `/mock-library/*.jpg`.

**Acceptance**: files gone, build green, no 404s in the built site for the old cover paths.
