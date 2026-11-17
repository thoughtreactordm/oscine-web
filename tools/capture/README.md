# tools/capture

Everything that turns the Oscine app into site media, reproducibly. The design
notes for the screenshot half are in `docs/1.0-site-release.md` §5.

| Script | What it does |
|---|---|
| `make-library.mjs` | Generates the fictional, playable library in `~/oscine-capture` (§5.1) |
| `serve.mjs` | Serves the fake podcast feeds |
| `shoot.mjs <key>\|--all` | Launches Oscine in a throwaway profile and captures the 2× PNG masters into `src/assets/screenshots/` |
| `crops.mjs` | Cuts the page crops from the masters |
| `record.mjs <flow>\|--all` | Records scripted flows as smooth 60 fps video into `src/assets/video/` |
| `hero.mjs` | Joins recorded flows into the home page's looping hero (`src/assets/video/hero.*`), with crossfades between clips and at the loop point. Re-run it after re-recording any of its flows |

`shoot.mjs` and `record.mjs` share `lib/oscine.mjs`: the launch, the CDP
session, the renderer helpers and the library/state setup. Both start from the
same base state: dark Oscine theme, overlays and toasts closed, EQ off, stage
visualizer off, and the capture lead playing.

## Recording video

```sh
node tools/capture/make-library.mjs        # once
node tools/capture/record.mjs --list       # flows and options
node tools/capture/record.mjs stage-visualizer
node tools/capture/record.mjs --all
node tools/capture/record.mjs --all --reencode --width 2560   # new encodes, no re-record
```

An Oscine window opens while it runs. Leave it on a visible workspace; see
[Limits](#limits). Audio is muted (`--mute-audio`) unless you pass `--audible`.
The run is ~10× slower than real time with PNG frames (60 s for a 6 s clip);
`--jpeg` saves about a quarter of that at a small quality cost.

Each flow produces:

| File | What |
|---|---|
| `~/oscine-capture/video/<flow>.mkv` | Lossless FFV1 master, 2560×1640 RGB. Every deliverable comes from this, so a size or quality change is `--reencode`, not a re-record |
| `src/assets/video/<flow>.webm` | AV1 (SVT-AV1, CRF 34), 10-bit 4:2:0. 10-bit keeps dark gradients and visualizer washes from banding |
| `src/assets/video/<flow>.mp4` | H.264 High (CRF 21), 8-bit, `+faststart`. The fallback for browsers without AV1, which is most Safari |
| `src/assets/video/<flow>.poster.jpg` | The frame at the flow's `poster` time |

Deliverables default to 1920 px wide (`--width`). The streams use the BT.709
matrix, limited range, and are tagged BT.709 throughout. Untagged output shifts
the accent colours. They live in `src/assets/` rather than `public/` so a
component imports them and Vite gives them content-hashed URLs, which means a
re-record each release never serves a stale cached clip:

```astro
---
import webm from '../assets/video/stage-visualizer.webm'
import mp4 from '../assets/video/stage-visualizer.mp4'
import poster from '../assets/video/stage-visualizer.poster.jpg'
---
<video autoplay muted loop playsinline poster={poster.src}>
  <!-- Main profile, level 5.0 (what SVT-AV1 signals here), 10-bit -->
  <source src={webm} type='video/webm; codecs="av01.0.12M.10"' />
  <source src={mp4} type="video/mp4" />
</video>
```

For scale, the sample flows at 1920 px come to 0.4 to 1.4 MiB of AV1 and
0.45 to 2.8 MiB of H.264 for 5 to 7 seconds. A 35 second hero will want a
higher CRF or a narrower width to stay at a few MB.

### Writing a flow

Flows live in `flows.mjs`. Each one has a `setup(app)` that runs in real time
before the first frame, and a `script(r)` that is the clip:

```js
'stage-visualizer': {
  description: 'Now Playing: the cover grows into the Halo visualizer',
  at: 12,        // playback position (s) at frame 0, the same on every run
  poster: 0,     // poster frame (s)
  async setup(app) {
    await app.eval(`await capture.route('now-playing'); return true;`)
  },
  async script(r) {
    await r.hold(0.8)
    await r.visualizer('halo')
    await r.hold(5)
  }
}
```

The capture lead is about 100 s long, so keep `at` plus the clip's length
under that unless the flow changes track itself.

The Recorder (`lib/recorder.mjs`). Anything that takes time records frames as
it goes:

| Call | Does |
|---|---|
| `hold(s)` | Record `s` seconds with nothing driven but the app |
| `advance(s, perFrame)` | Record `s` seconds, calling `perFrame(p, i)` before each frame (`p` runs to 1) |
| `scroll(target, { to \| by, seconds, ease })` | Scroll a container per frame. `'auto'` picks the page's largest scroller |
| `type(target, text, { cps, clear })` | Click into a field and type at a human pace (a fixed wobble, so it's reproducible) |
| `key(name, { ctrl, shift, alt, meta })` | A trusted key press: `Enter`, `Escape`, arrows, letters… |
| `click(target, { after })` | A trusted mouse click at the target's centre |
| `hover(target, { seconds })` | Move the (invisible) pointer, gliding if `seconds` > 0 |
| `drag(target, { dx, dy, seconds, ease })` | Press, drag by CSS px over `seconds`, release |
| `waitFor(selector)` / `until(expr)` | Record frames until a selector shows or an expression holds |
| `settle(expr)` | Wait in real time with the clock frozen. No frames, for loads the viewer shouldn't sit through |
| `route(name)`, `theme(name, mode)` | Navigate; switch theme live |
| `palette(query)` | Open the command palette and type into it |
| `visualizer(effect \| false)` | Show the stage visualizer with an effect, or hide it |
| `tunedeck(tab \| false)` | Open the Tunedeck on a tab, or close it |
| `play({ title, album, artist, at })` | Play a library track, its album queued behind it |
| `eqDrag(band, { dx, dy, seconds })` | Drag an EQ band handle on Tools → Equalizer |
| `eval(js)` | Anything else: renderer code with the `capture` helpers in scope |

A target is a label string (a control's `aria-label` or exact text),
`{ label, index }`, `{ selector, index }`, `{ placeholder }` or
`{ text, within }`. Eases are `linear`, `in`, `out` and `inOut`.

## How it works: lockstep, not screencast

`lib/clock.js` is injected into the renderer's main world (renderer memory
only, never the app bundle). Once it's installed, the page's time only moves
when the recorder steps it, one 1/60 s frame at a time:

- `requestAnimationFrame` callbacks are queued and run once per step with the
  virtual timestamp. `performance.now` returns virtual time.
- `setTimeout` and `setInterval` fire in order as virtual time passes, with
  microtasks drained between them.
- CSS animations, transitions and Web Animations are paused and seeked by
  each step's dt. One that starts after install starts from its first frame.
- The AudioContext that playback renders through is suspended. Each step
  resumes it just long enough for `currentTime` to reach the frame's audio
  time, then suspends it again. The visualizers read the real analyser of the
  real graph (EQ included) at the right moment, and the seek bar and lyrics
  move at video speed.

Then each frame waits for two real compositor frames and takes
`Page.captureScreenshot` of the composited surface. With
`Emulation.setDeviceMetricsOverride` pinning 1280×820 at DPR 2, every frame is
2560×1640 whatever size the window manager gave the window.

### The spike (W26-3)

Same machine (RTX 4070 Ti SUPER, Hyprland, window on a 240 Hz monitor), same
two flows recorded both ways for 5 s, then judged at 60 fps:

- **visualizer:** Now Playing with Halo, real audio
- **library scroll:** the songs list, scrolled 0 to 2400 px with an ease-in-out

**CDP screencast** (`Page.startScreencast`, JPEG q90, an ack per frame,
real time):

- **Wrong frame, so disqualified on its own:** the frames are the real
  window surface (1261×1378 here, the Hyprland tile, at DPR 1), not the
  emulated viewport. The 1280×820 page sat in the corner, clipped on the
  right. Frame size and DPR follow the window manager.
- **Pacing:** about 100 fps, delivered when JPEG encoding allowed rather
  than on vsync (intervals: p50 10 ms, p95 13 ms). Resampled to 60 fps:
  - Scroll: per-frame steps wobbled 15 → 26 → 20 px around a smooth curve
    (judder RMS 2.1 px, worst 7.4 px), plus one 83 ms hitch.
  - Visualizer: 20 of 298 output frames repeated or skipped a step, a
    visible stutter about twice a second.
- **Machine dependence:** all of this changes with the monitor the window
  lands on (60, 144 and 240 Hz here).

**Lockstep** (`lib/clock.js` + `Page.captureScreenshot`):

- Exactly 60 evenly spaced frames per second, with no stale frames
  (`framemd5`: 0 repeats in 300).
- Scroll: the clip moves exactly 2400 px. Steps follow the easing curve with
  0.42 px RMS deviation, which is the integer-pixel floor of the measurement.
- Visualizer: frame-to-frame change is even (coefficient of variation 0.19),
  never doubled.
- Audio clock: it stops at most one render burst past each target (512
  frames, 10.7 ms; mean 5 ms). Targets are absolute, so that never adds up,
  and no frame went without audio progress.
- Cost: about 10× real time. A 2560×1640 PNG screenshot takes ~130 ms, and
  the step (audio resume/suspend plus two real frames) ~30 ms.

I didn't try CDP virtual time (`Emulation.setVirtualTimePolicy`) or
`HeadlessExperimental.beginFrame`. BeginFrame control needs headless Chromium
and the app runs in a real Electron window. Neither one drives Web Audio, and
the visualizers need that. The injected clock covers rAF, timers, CSS
animations and audio without an app patch, and worked first time, so that's
what `record.mjs` is built on.

### Reproducibility

Two back-to-back recordings of `library-flythrough` (417 frames), compared on
the lossless masters:

- 124 frames are bit-identical, and every frame is at least 49 dB PSNR. You
  can't see the difference.
- **Seek-bar edge:** a pixel apart in some frames, from the audio clock's
  burst granularity.
- **±1 level** in the translucent player bar.
- **±5 levels** on a few sidebar album thumbnails, which Chromium decodes
  asynchronously in real time.

Two bugs caught on the way, now fixed:

- An animation adopted mid-flight kept its real-time head start, which
  varied with screenshot time.
- The setup seek let audio run on for however long setup took.

## Limits

- **Keep the window on a visible workspace.** Each step waits for two real
  compositor frames, and Wayland compositors stop sending frame callbacks to
  hidden surfaces. Recording with the window hidden is untested. If a frame
  gets no compositor frame within 250 ms the recorder logs a warning and goes
  on.
- **What stays on the real clock:** `Date.now`, `requestIdleCallback`, timers
  scheduled before the clock was installed (the engine's position ticker, for
  one: harmless, it reads the stepped audio clock), the text caret blink,
  async image decoding, and IPC round trips. IPC-driven updates such as search
  results can land a frame apart between runs.
- **Synthetic audio.** The fake library is synthetic, generated by
  `make-library.mjs` with no third-party audio and nothing to license. Its
  tones are slow and drone-like, so the visualizers move calmly. If the hero
  wants beat-driven motion, add a rhythmic track to `library.json` and
  generate it the same way.
- **Visualizer quality** is the app's default (`auto`: 1920×1080 internal
  target, scaled up). A flow can set `interface.visualizerQuality` to `high`
  in its `setup` for native resolution.
