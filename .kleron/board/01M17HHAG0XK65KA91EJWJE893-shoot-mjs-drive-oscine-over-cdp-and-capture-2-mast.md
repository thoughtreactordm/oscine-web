---
taskId: 01M17HHAG0XK65KA91EJWJE893
title: shoot.mjs — drive Oscine over CDP and capture 2× masters
status: done
priority: high
labels:
  - capture
  - tooling
workstream: W1
workstreamId: W1-2
effort: high
order: 1
created: '2026-08-29T19:56:51.584Z'
updated: '2026-08-29T20:34:15.707Z'
---
Spec: `docs/1.0-site-release.md` §4 (framing, size, shot list) and §5.2.

Write `tools/capture/shoot.mjs` in this repo (no deps beyond Node 24's WebSocket; pattern in `/tmp/flash-probe/probe.mjs` and the app's `scripts/cdp-eval.mjs`).

- Throwaway profile: `XDG_CONFIG_HOME=~/oscine-capture/config`; first launch on an empty profile captures `onboarding`, then set `interface.onboardingCompleted` (or complete the wizard) and point the library at `~/oscine-capture/library`.
- Launch the app from `~/Projects/Web Dev/oscine` with `npm run dev -- -- --remote-debugging-port=9222`; attach; wait for the renderer to be ready.
- State setters via `Runtime.evaluate` against the renderer stores: theme (oscine-dark / oscine-light / nocturne), view/route, Tunedeck tab, palette open, Quick Menu open, Stage, Zen, track info modal, Tools write-back review. Check the store names in `src/renderer` first and document each setter at the top of the file.
- Capture with `Emulation.setDeviceMetricsOverride({ deviceScaleFactor: 2 })` + `Page.captureScreenshot` at the app's 1280×820 → 2560×1640 PNG into `src/assets/screenshots/<key>.png`. Bare window incl. the app's own title bar; no OS chrome.
- CLI: `node tools/capture/shoot.mjs <key>|--all [--keep-open]`. Re-runnable; each key idempotent.
- Do not patch the app. If a section needs more room, `Browser.setWindowBounds`.

**Acceptance**: `--all` produces every key in the §4 list with no manual steps beyond `serve.mjs` running; a second run reproduces the same frames.
