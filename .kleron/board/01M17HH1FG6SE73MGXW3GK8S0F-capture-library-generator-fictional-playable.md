---
taskId: 01M17HH1FG6SE73MGXW3GK8S0F
title: 'Capture library generator (fictional, playable)'
status: done
priority: high
labels:
  - capture
  - tooling
workstream: W1
workstreamId: W1-1
effort: medium
order: 0
created: '2026-08-29T19:56:42.352Z'
updated: '2026-08-29T20:34:07.658Z'
---
Spec: `docs/1.0-site-release.md` §5.1.

Built: `tools/capture/library.json` (17 artists, 43 albums, ~360 tracks, 2 podcasts; satirical streaming-trope register, no real names), `tools/capture/make-library.mjs` (ffmpeg-synthesized 20–40 s tracks in FLAC/MP3/Opus/Ogg, 3 albums at 48k/24-bit, tags + embedded covers, ReplayGain via metaflac on ~15 FLAC albums, generated abstract covers where no credited Unsplash cover exists, podcast RSS feeds), `tools/capture/serve.mjs` (localhost feed server).

**Review needed from Michael**
- Read `library.json` for register: ribbing, not sneering; nothing that reads as a real band, service, or product.
- Spot-check a few generated covers in `~/oscine-capture/library/*/*/cover.jpg`.

**Acceptance**
- `node tools/capture/make-library.mjs` completes with 0 failures; `manifest.json` written.
- Oscine (throwaway profile) scans `~/oscine-capture/library` and every format plays with correct artist/album/track/cover; the 24-bit albums read as 48 kHz / 24-bit in the track info modal; ReplayGain albums show tag gain, the rest get measured.
- Podcasts view subscribes to both feeds from `serve.mjs` and downloads an episode.
