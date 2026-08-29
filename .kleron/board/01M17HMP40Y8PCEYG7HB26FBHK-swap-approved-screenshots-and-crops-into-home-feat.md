---
taskId: 01M17HMP40Y8PCEYG7HB26FBHK
title: 'Swap approved screenshots and crops into Home, Features, Learn; OG image'
status: todo
priority: medium
labels:
  - design
  - screenshots
workstream: W2
workstreamId: W2-6
dependsOn:
  - 01M17HHRB0NY2RC2MCXCWAX5GC
  - 01M17HHXGQ7ABEN3H2SXW5M1KB
effort: low
order: 9
created: '2026-08-29T19:58:41.792Z'
updated: '2026-08-29T19:58:41.792Z'
---
Blocked until the contact sheet is signed off and crops are generated (W1).

- Replace every placeholder frame in Home and Features with the approved master or crop from `src/assets/screenshots/`; fill the screenshot slots the Learn articles marked (`<!-- shot: key -->` convention from W3).
- Alt text for every image: describe what is on screen in one plain sentence, not the feature name.
- OG image: `library-hero` at 1200×630 from the crops script, wired in `BaseLayout.astro` (per-page override where a page has a better frame).
- Check the built AVIF/WebP sizes; the hero at 1920 wide should stay under ~250 KB.

**Acceptance**: no placeholder frames remain in `src/`; `npm run build` emits AVIF/WebP for every image; OG preview validated with a card debugger.
