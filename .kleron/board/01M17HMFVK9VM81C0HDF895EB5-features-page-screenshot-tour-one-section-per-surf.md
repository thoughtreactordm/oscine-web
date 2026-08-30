---
taskId: 01M17HMFVK9VM81C0HDF895EB5
title: 'Features page: screenshot tour, one section per surface'
status: in-review
priority: high
labels:
  - design
  - copy
  - features
workstream: W2
workstreamId: W2-5
effort: high
order: 1
created: '2026-08-29T19:58:35.379Z'
updated: '2026-08-30T03:38:34.652Z'
---
Spec: `docs/1.0-site-release.md` §3.2 (section table with shot keys and what each covers), voice §2.

New `src/pages/features.astro` (+ a `FeaturesTour.vue` or per-section Astro components). Sections in the table's order, each = screenshot + heading + one or two paragraphs, image side alternating: Library, Tunedeck, Themes (light/dark/Nocturne trio + editor), Curate & Discover, Stage & Zen, Playback, Stats, Podcasts, Tools, Quick access, Scrobbling (icon row + one line, no shot).

- Facts come from the app at rc.3 — verify each claim in `~/Projects/Web Dev/oscine` (`src/renderer`, `src/main`) rather than from the current site copy, which has drift (§6). Discover has nine recipes: name a few. Network features are opt-in: one line, in the Tunedeck or Scrobbling section, nothing more.
- Placeholder frames sized to the masters; the swap card drops in the real ones. Themes section needs three frames side by side — design that slot for 3 × (1280×820) at 2× without a horizontal scroll on mobile.
- Second person throughout; no "I"/"we". Concrete nouns: FLAC, ReplayGain, Ctrl+K, .m3u8, 100k tracks.

**Acceptance**: every section's claims checked against the app; page passes the tells list; nav links to it; PR preview reviewed by Michael.
