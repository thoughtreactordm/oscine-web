---
taskId: 01M17HMX0JZHZAADZGB37P10JT
title: 'Learn drift pass A: Getting started, Library, Curate, Tunedeck'
status: in-progress
priority: high
labels:
  - docs
  - learn
workstream: W3
workstreamId: W3-1
effort: medium
order: 0
created: '2026-08-29T19:58:48.850Z'
updated: '2026-08-30T17:19:41.424Z'
---
Spec: `docs/1.0-site-release.md` §3.3 table, voice §2. Source of truth is the app at rc.3 in `~/Projects/Web Dev/oscine` — read the renderer/main code and the app's own docs, not the current article, for every claim.

- **Getting started**: add the first-run wizard section, a "Stage and Zen mode" section, ListenBrainz alongside Last.fm; check the library-folder flow matches the current settings UI.
- **Library**: drift check; add a link to the new "Tools: editing tags" article; column chooser, grouping, density options as they exist today.
- **Curate**: drift check; Discover has nine recipes — name them accurately; two-layer queue and shuffle behavior as implemented.
- **Tunedeck**: drift check; four tabs; what works offline vs with lookups on.
- Mark screenshot slots with `<!-- shot: <key> -->` where an image shows something words don't; the swap card fills them.
- American spelling (the app has British strings — do not copy them). Second person, concrete, no marketing register in how-to text.

**Acceptance**: every statement verifiable in the app source; no British spellings; `npm run build` green; frontmatter descriptions updated.
