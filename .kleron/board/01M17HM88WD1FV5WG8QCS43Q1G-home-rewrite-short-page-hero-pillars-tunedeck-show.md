---
taskId: 01M17HM88WD1FV5WG8QCS43Q1G
title: 'Home rewrite: short page, hero + pillars + Tunedeck showcase + why + CTA'
status: todo
priority: high
labels:
  - design
  - copy
  - home
workstream: W2
workstreamId: W2-4
effort: high
order: 7
created: '2026-08-29T19:58:27.611Z'
updated: '2026-08-29T19:58:27.611Z'
---
Spec: `docs/1.0-site-release.md` §3.1, voice §2 (read the "tells to avoid" list before writing a word), positioning §1.

Structure, in order: (1) hero — "Your library, taken seriously." + the agreed first-person subhead, Download + See features buttons, full-width `library-hero` frame below; (2) three pillars Control · Design · Yours, each a title + two sentences + a tight crop, no icons; (3) Tunedeck showcase — `tunedeck-track`, one paragraph in the §2 reference register plus the one-line opt-in lookups sentence; (4) "Why" — three short first-person paragraphs from the §2 anchor facts (draft; Michael does a pass, it's his voice); (5) CTA — "Get Oscine. Free for Windows and Linux." with the download buttons.

- Remove the current features grid (moves to Features), "Everything within reach", and the `PlayerFrame` usage. Leave the `PlayerFrame.astro`/`mock-library.ts` files for the retirement card.
- Build the layout against placeholder frames sized to the real masters (2560×1640, i.e. 1280×820 at 2×); the swap card drops the approved shots in. Use `astro:assets` `<Image>` with AVIF/WebP at 1280/1920 from the start so the swap is a path change.
- American spelling. No "Not X, but Y", no fragment stacks, no rhetorical headers, no MusicBee mention (foobar2000 and fooyin are fine — true lineage).

**Acceptance**: page reads in under a minute; every sentence passes the tells list; Lighthouse CLS stays ≤ 0.01 with the placeholder frames; PR preview reviewed by Michael.
