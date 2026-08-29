---
taskId: 01M17HHXGQ7ABEN3H2SXW5M1KB
title: Crops and derived images from the 2× masters
status: done
priority: medium
labels:
  - capture
workstream: W1
workstreamId: W1-5
effort: low
order: 4
created: '2026-08-29T19:57:11.063Z'
updated: '2026-08-29T22:21:22.717Z'
---
Cut every crop the pages need from the approved masters — never re-capture (§4).

- Home pillars: track-list columns (from `library-hero`), the Stage (from `stage`), the theme picker (from `theme-editor` or settings).
- Features: column chooser crop, track info modal crop (`track-info`), Themes trio side by side.
- OG image: `library-hero` at 1200×630, not the mark (§7).
- Script it: `tools/capture/crops.mjs` with a crop table `{ key, source, x, y, w, h }` so a re-shoot regenerates everything. `sharp` is acceptable as a devDependency; otherwise ffmpeg.
- Output into `src/assets/screenshots/crops/`; pages consume through `astro:assets` (AVIF/WebP at 1280 and 1920 widths).

**Acceptance**: all crops referenced by W2 pages exist and are generated, not hand-made; running the script twice is a no-op.

## Built — 2026-08-29

`node tools/capture/crops.mjs` writes `src/assets/screenshots/crops/<key>.png`. Coordinates are pixels on the 2560×1640 masters. A second run compares bytes and leaves matching files untouched.

| key | source | x, y, w, h | output |
|---|---|---|---|
| `pillar-columns` | `library-hero` | 656, 144, 1888, 736 | Home Control pillar |
| `pillar-stage` | `stage` | 720, 180, 1200, 1180 | Home Design pillar |
| `pillar-theme-picker` | `theme-editor` | 375, 238, 1808, 1164 | Home Yours pillar (token editor modal) |
| `column-chooser` | `library-hero` | 656, 144, 1888, 112 | Features Library — Songs toolbar + headers + columns-3 button |
| `track-info` | `track-info` | 504, 194, 1552, 1254 | Features Playback modal |
| `og` | `library-hero` | 0, 0, 2560, 1344 → 1200×630 | Open Graph |
| `themes-trio` | dark / light / nocturne | full frame × 3, 960px panels, 20px gap | Features Themes |

The column-chooser *popover* is not in any master (card forbids a re-capture). The crop is the control and the column headers as they appear on `library-hero`.

W2 pages are still placeholders; W2-6 swaps these in. Re-run this script after any W1-4 re-shoot.
