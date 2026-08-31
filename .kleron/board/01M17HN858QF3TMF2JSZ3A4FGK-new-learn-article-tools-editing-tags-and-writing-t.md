---
taskId: 01M17HN858QF3TMF2JSZ3A4FGK
title: 'New Learn article: Tools — editing tags and writing them back'
status: in-progress
priority: high
labels:
  - docs
  - learn
  - new
workstream: W3
workstreamId: W3-3
effort: medium
order: 2
created: '2026-08-29T19:59:00.263Z'
updated: '2026-08-30T18:33:42.448Z'
---
Spec: `docs/1.0-site-release.md` §3.3 (new article row). Read the Tools implementation in the app (`src/renderer` Tools view, `src/main` write-back and backup code) before writing.

Cover: staged overrides (edits live in the app until you choose to write), the review step, write-back per format (what tags go where for FLAC/MP3/Opus/Ogg), backups and rollback, and — explicitly — what never happens implicitly (no silent file writes, no renames unless asked). Include a short "if something goes wrong" section pointing at the backup location.

- `src/content/learn/tools.md`, frontmatter consistent with the others; slot `<!-- shot: tools-writeback -->`.
- The capture library at `~/oscine-capture/library` is a safe place to try the flow while writing.
- Second person, plain, American spelling.

**Acceptance**: a reader can edit a tag, review, write, and roll back by following the article alone; every claim checked against the code.
