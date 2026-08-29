---
taskId: 01M17HPP3X215B7ZA9KHEEB14Y
title: App-repo follow-ups the site depends on
status: todo
priority: medium
labels:
  - app-repo
  - needs-michael
workstream: W4
workstreamId: W4-6
effort: low
order: 20
created: '2026-08-29T19:59:47.325Z'
updated: '2026-08-29T19:59:47.325Z'
---
Decisions and one-line changes in `thoughtreactordm/oscine` that affect the site (`docs/1.0-site-release.md` §3.4, §9):

1. **Pre-release flag**: `ci.yml` runs `gh release create` without `--prerelease` for `-rc.` tags, so `/releases/latest` returns rc.3. Add the flag for `-rc.` versions (or accept RCs as latest until 1.0.0).
2. **Linux asset shape**: keep the single `Oscine-v<ver>-linux.tar.gz` or attach the AppImage and `.deb` separately? Separate is cleaner for the Download page and lets the AppImage run without an extract step. Decide before tagging 1.0.0; the Download card handles either.
3. **British spellings in the app** ("colour", "customisation") — Michael noted he'll fix these app-side; the site uses American regardless.
4. **Checksums**: none needed app-side — GitHub exposes `sha256` digests on every asset.

**Acceptance**: decisions recorded here; site cards updated if (2) changes the asset names.
