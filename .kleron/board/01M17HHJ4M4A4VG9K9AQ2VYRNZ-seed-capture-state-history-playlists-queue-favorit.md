---
taskId: 01M17HHJ4M4A4VG9K9AQ2VYRNZ
title: 'Seed capture state: history, playlists, queue, favorites, Discover shelves'
status: done
priority: medium
labels:
  - capture
workstream: W1
workstreamId: W1-3
effort: medium
order: 0
created: '2026-08-29T19:56:59.412Z'
updated: '2026-08-29T20:32:00.000Z'
---
Spec: `docs/1.0-site-release.md` §4 "State before shooting" and §5.3.

Target state in the throwaway profile before any shot: a track playing (not paused) ~1:10 in at ~70% volume, a queue of ~12 items with a couple hand-queued so the two-layer queue shows, at least three playlists in the rail (one saved from Discover), one favorite starred, a listening log spanning a few weeks so Stats has ranges and Discover has material.

- Read `src/main` in the app for the listens/history schema. If rows are simple, insert them directly (dates spread over ~6 weeks, weighted toward a handful of artists so "top" lists look real). Otherwise drive playback and skip at the listened threshold — the tracks are 20–40 s on purpose.
- Confirm which of Discover's nine recipes fire against this library; adjust seeding until at least four shelves render with a reason on every card.
- Implement as `tools/capture/seed-state.mjs` (or a `--seed` step in shoot.mjs) so it is reproducible from a fresh profile.

**Acceptance**: fresh profile → seed → Stats, Discover, Curate, and Tunedeck "Related" all have real content; documented in the file header what each seeded thing exists for.

**Built and verified (2026-08-29)**

- `tools/capture/seed-state.mjs` safely targets only the registered throwaway library and reproducibly writes 172 listens over 42 days, 48 play-history rows, three favorites, and three populated playlists (one dated Discover snapshot).
- `shoot.mjs` runs the durable seed after scanning, refreshes the playlist rail, starts the designated capture lead at 1:10 and 70% volume, and builds the two-tier queue as 2 hand-queued + 10 session rows.
- Real-app CDP verification produced five shelves (`for-you`, `almost-finished`, `forgotten-favorites`, `because-favorited`, `unplayed`), all with at least three cards and a non-empty reason on every card.
- Stats rendered the 7/30/90-day, year, and all-time ranges with 172 total listens; the 30-day view held 120 plays across 18 tracks and six artists. Tunedeck Related rendered album, genre, and year strands for the playing track.
