---
taskId: 01M17HHRB0NY2RC2MCXCWAX5GC
title: First full shoot + contact sheet for review
status: done
priority: high
labels:
  - capture
  - needs-michael
workstream: W1
workstreamId: W1-4
effort: medium
order: 3
created: '2026-08-29T19:57:05.760Z'
updated: '2026-08-29T22:21:22.704Z'
---
Run `shoot.mjs --all` against the seeded profile and produce `tools/capture/contact-sheet.png` (all 19 keys, labeled, ~4 columns) plus a short note per shot on anything that looks wrong (empty pane, placeholder text, British spelling in the app, clipped content).

Michael reviews the sheet before any copy is written against the shots (§8 step 4). Capture his notes on this card; re-shoot the affected keys.

Shot list: `library-hero`, `tunedeck-artist` (offline state — fictional artists get no biography; see §5.3), `tunedeck-track`, `tunedeck-related`, `tunedeck-playing`, `theme-oscine-dark`, `theme-oscine-light`, `theme-nocturne`, `theme-editor`, `curate-discover`, `stage`, `zen`, `stats`, `podcasts`, `tools-writeback`, `palette`, `quick-menu`, `onboarding`, `track-info`.

**Acceptance**: sheet reviewed and signed off; `src/assets/screenshots/` holds the approved 2× masters; sign-off noted here.

## Capture run — 2026-08-29 (photographic covers)

Michael asked to drop random color gradients in favor of Unsplash photographs. The first Unsplash pass still looked gradient-heavy because:

- the six named covers (`owned-until-revoked.jpg` and friends) were Unsplash 3D/CSS abstracts and were **kept**, not refreshed, so now-playing and several sidebar albums stayed blobs;
- `covers/sources.json` still included Milad Fakurian and Pawel Czerwinski 3D renders that read as generated gradients at thumbnail size.

Fix: every album and both podcasts now get a 1000×1000 crop from a photographic-only pool in `covers/sources.json` (landscapes, architecture, textures; no 3D abstracts, no identifiable people). Named `cover` fields were removed from `library.json`. Embedded FLAC/MP3 pictures were re-stamped; the capture artwork cache was cleared; `shoot.mjs --all --port 9333` was run again. Contact sheet: `tools/capture/contact-sheet.png` (2544×2355).

Now-playing (`Owned Until Revoked`) is a chicken-wire macro with warm bokeh — a photograph, not an ffmpeg gradient. Discover shelves are photographs. Tiny sidebar thumbs can still look abstract because they are 32px crops of real photos.

### Pre-review observations (this run)

- `library-hero` — Populated. Sidebar albums are photographs. Fixture title `A Catalogue of Absences` is British spelling in the library name, not UI copy.
- `tunedeck-artist` — Expected fictional-artist/offline state. Header still clips at `Turn them on in…`; empty-state sentences still clip to one line in the narrow pane.
- `tunedeck-track` — Populated; no obvious issue.
- `tunedeck-related` — Populated; long rows ellipsize in the narrow pane.
- `tunedeck-playing` — 2 hand-queued + 10 continuing; no obvious issue.
- `theme-oscine-dark` / `theme-oscine-light` / `theme-nocturne` — Populated library frames with photographic thumbs.
- `theme-editor` — American `Color roles` and `cancelable`. The next `Error` row is still cut by the modal’s sticky footer.
- `curate-discover` — Shelves populated with photographs. Intro copy uses American `catalog`. Horizontal shelves still clip the next card at the right edge (deliberate).
- `stage` / `zen` — Photographic stage art; yellow drawer/reveal handle still half-visible on the left edge.
- `stats` — Populated; lower ranking rows continue behind the player.
- `podcasts` — Both fictional shows populated.
- `tools-writeback` — Four-track review; edited title still truncates; year column still off-screen to the right.
- `palette` — Search results populated.
- `quick-menu` — Recent additions populated; favorite playlists/artists still show empty placeholders.
- `onboarding` — Expected empty library behind the modal.
- `track-info` — Populated details/format/ReplayGain modal.

### Michael review

Pending. Do not write copy against these shots or mark the card done until Michael records sign-off or identifies keys to re-shoot.
