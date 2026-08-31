---
taskId: 01M17HNDNM2EE0JE8D48EFRYJF
title: 'New Learn article: Keyboard & shortcuts'
status: in-progress
priority: medium
labels:
  - docs
  - learn
  - new
workstream: W3
workstreamId: W3-4
effort: medium
order: 3
created: '2026-08-29T19:59:05.908Z'
updated: '2026-08-30T18:40:58.929Z'
---
Spec: `docs/1.0-site-release.md` §3.3 (new article row). Extract the real bindings from the app's shortcut registry (search `src/renderer` for the keymap / global shortcut registration in `src/main`) — do not invent any.

Cover: global shortcuts (work when the window isn't focused), in-app shortcuts by area (playback, navigation, library, queue), command palette prefixes, double-click behavior on tracks/albums, media keys, and whether any of it is customizable today (say so plainly if not).

- `src/content/learn/keyboard.md`; render the bindings as tables using `<kbd>` (the doc-body styles already cover tables).
- Windows and Linux keys; note any differences.
- Slot `<!-- shot: palette -->`.

**Acceptance**: every binding matches the registry at rc.3; Quick access article links here.
