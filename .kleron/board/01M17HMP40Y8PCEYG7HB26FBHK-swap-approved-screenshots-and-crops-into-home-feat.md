---
taskId: 01M17HMP40Y8PCEYG7HB26FBHK
title: 'Swap approved screenshots and crops into Home, Features, Learn; OG image'
status: done
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
order: 1
created: '2026-08-29T19:58:41.792Z'
updated: '2026-08-30T04:10:36.562Z'
---
Blocked until the contact sheet is signed off and crops are generated (W1).

- Replace every placeholder frame in Home and Features with the approved master or crop from `src/assets/screenshots/`; fill the screenshot slots the Learn articles marked (`<!-- shot: key -->` convention from W3).
- Alt text for every image: describe what is on screen in one plain sentence, not the feature name.
- OG image: `library-hero` at 1200×630 from the crops script, wired in `BaseLayout.astro` (per-page override where a page has a better frame).
- Check the built AVIF/WebP sizes; the hero at 1920 wide should stay under ~250 KB.

**Acceptance**: no placeholder frames remain in `src/`; `npm run build` emits AVIF/WebP for every image; OG preview validated with a card debugger.

## Done — 2026-08-30

W1 contact sheet and crops are in `src/assets/screenshots/` (19 masters + 7 crops). Pages consume them through `astro:assets`.

- **Home** — `library-hero`, pillar crops (`pillar-columns`, `pillar-stage`, `pillar-theme-picker`), `tunedeck-track`.
- **Features** — every spec surface, including the `column-chooser` crop under Library. Tour shots emit 1280w + 1920w AVIF/WebP srcsets.
- **Learn** — all eight marked `<!-- shot: key -->` slots resolve to a PNG + sentence alt. Tools and Keyboard articles are still W3; when they land, `LearnBody` will pick up `tools-writeback` / `palette` automatically.
- **OG** — `crops/og.png` (1200×630) in `BaseLayout`; card debugger artifact `og-card-debugger` v1. Default frame is the library window, which is the right crop for every current page.
- **Build** — `npm run build` green. Hero AVIF at 1920 is 67 KB (WebP 103 KB), under the 250 KB cap. 60 AVIF + 60 WebP emitted.

`PlayerFrame.astro` / `mock-library.ts` are unused leftovers for the W4 retirement card, not rendered on Home/Features/Learn.
