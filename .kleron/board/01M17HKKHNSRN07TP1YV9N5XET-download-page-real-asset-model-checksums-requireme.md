---
taskId: 01M17HKKHNSRN07TP1YV9N5XET
title: 'Download page: real asset model, checksums, requirements, updates'
status: in-review
priority: urgent
labels:
  - design
  - download
workstream: W2
workstreamId: W2-1
effort: medium
order: 0
created: '2026-08-29T19:58:06.389Z'
updated: '2026-08-30T02:07:10.886Z'
---
Spec: `docs/1.0-site-release.md` §3.4. The live page renders dead Linux buttons today — real releases carry exactly two assets: `Oscine.Setup.<ver>.exe` and `Oscine-v<ver>-linux.tar.gz` (AppImage + .deb inside).

- `src/data/release.ts` → `{ windows, linux }` with `sha256` from GitHub's `assets[].digest`; fallback 1.0.0 with those two names. Fail loudly in dev if neither matches; never render an empty button.
- `DownloadView.vue` / `DownloadButtons.vue`: two buttons, size, SHA-256 per asset with a copy button, "What you need" (Windows 10+ 64-bit; Linux x86_64, FUSE 2 or `--appimage-extract-and-run`, `.deb` for Debian/Ubuntu-family), the two-line unpack instructions, one sentence on manual updates pointing at `/changelog`, one sentence that macOS is not a target — no justification.
- Copy in the §2 voice. Second person, concrete, no caveats beyond the above.
- If the app repo switches to separate AppImage/.deb assets before 1.0 (§9 open question), `release.ts` should handle both shapes; write it that way now.

**Acceptance**: `npm run build` against the live API shows correct buttons for rc.3; unit-test the asset matcher against the rc.3 asset list and a hypothetical separate-assets list.
