/**
 * recorder.mjs — the flow DSL. A flow is an async function that drives a
 * Recorder; every call that takes time records frames as it goes.
 *
 * Time is virtual (lib/clock.js): the page only moves when the recorder steps
 * it, one 1/fps frame at a time, and each step ends with a Page.captureScreenshot
 * of the composited surface. So a flow reads like a screen recording script,
 * but the output is exactly `fps` evenly spaced frames per second however long
 * each frame takes to render and capture.
 *
 * Two kinds of waiting:
 *   hold / waitFor / until   record frames (video time passes)
 *   settle                   wait in real time with the clock frozen (no
 *                            frames): for IPC-driven loads the viewer should
 *                            not sit through
 *
 * Targets (click, drag, type, scroll) are one of:
 *   'Label'                         a button / tab / menu item / option whose
 *                                   aria-label or text is exactly this
 *   { label, index }                same, the nth match
 *   { selector, index }             a CSS selector, the nth match
 *   { placeholder }                 an input by placeholder
 *   { text, within }                the smallest element whose text is exactly
 *                                   this, optionally inside a selector
 */

import { readFile } from 'node:fs/promises'

const clockSource = await readFile(new URL('./clock.js', import.meta.url), 'utf8')

export const EASE = Object.freeze({
  linear: (p) => p,
  in: (p) => p * p * p,
  out: (p) => 1 - Math.pow(1 - p, 3),
  inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)
})

const KEYS = {
  Enter: { code: 'Enter', keyCode: 13, text: '\r' },
  Escape: { code: 'Escape', keyCode: 27 },
  Tab: { code: 'Tab', keyCode: 9 },
  Backspace: { code: 'Backspace', keyCode: 8 },
  Delete: { code: 'Delete', keyCode: 46 },
  ArrowUp: { code: 'ArrowUp', keyCode: 38 },
  ArrowDown: { code: 'ArrowDown', keyCode: 40 },
  ArrowLeft: { code: 'ArrowLeft', keyCode: 37 },
  ArrowRight: { code: 'ArrowRight', keyCode: 39 },
  Home: { code: 'Home', keyCode: 36 },
  End: { code: 'End', keyCode: 35 },
  PageUp: { code: 'PageUp', keyCode: 33 },
  PageDown: { code: 'PageDown', keyCode: 34 },
  ' ': { code: 'Space', keyCode: 32, text: ' ' }
}

const MODIFIERS = { alt: 1, ctrl: 2, meta: 4, shift: 8 }

/** Renderer-side target lookup, installed next to the clock. */
const LOCATE_SOURCE = `
  window.__oscineRecord = window.__oscineRecord || (() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
    };
    const clickable = 'button, [role="button"], a[href], [role="tab"], [role="menuitem"], [role="menuitemradio"], [role="option"], [role="slider"], [role="switch"], [role="checkbox"], summary, label';
    function find(target) {
      const t = typeof target === 'string' ? { label: target } : target;
      let nodes;
      if (t.selector) nodes = [...document.querySelectorAll(t.selector)];
      else if (t.placeholder) nodes = [...document.querySelectorAll('input, textarea')].filter((n) => n.getAttribute('placeholder') === t.placeholder);
      else if (t.label) {
        const wanted = t.label.trim();
        nodes = [...document.querySelectorAll(clickable)].filter((n) =>
          n.getAttribute('aria-label')?.trim() === wanted || n.textContent?.trim() === wanted);
      } else if (t.text) {
        const root = t.within ? document.querySelector(t.within) : document.body;
        const wanted = t.text.trim();
        nodes = root ? [...root.querySelectorAll('*')].filter((n) => n.textContent?.trim() === wanted) : [];
        // innermost matches only
        nodes = nodes.filter((n) => !nodes.some((m) => m !== n && n.contains(m)));
      } else throw new Error('Unknown target: ' + JSON.stringify(target));
      nodes = nodes.filter(visible);
      const node = nodes[t.index ?? 0];
      if (!node) throw new Error('No visible target: ' + JSON.stringify(target) + ' (' + nodes.length + ' matches)');
      return node;
    }
    function center(target) {
      const r = find(target).getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width, height: r.height };
    }
    /** The largest visible scroll container, for 'auto' scroll targets. */
    function scroller(target) {
      if (target && target !== 'auto') return find(target);
      const all = [...document.querySelectorAll('*')].filter((el) => {
        const s = getComputedStyle(el);
        return /(auto|scroll)/.test(s.overflowY) && el.scrollHeight - el.clientHeight > 200 && visible(el);
      });
      all.sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight);
      if (!all[0]) throw new Error('No scroll container on this page.');
      return all[0];
    }
    const scrollers = [];
    return { find, center, scroller, scrollers };
  })();
`

export class Recorder {
  #cdp
  #sink
  #index = 0
  #installed = false

  /**
   * @param cdp     CdpSession
   * @param sink    async (buffer, index) => void — receives each frame
   * @param options { fps, format: 'png' | 'jpeg', audio: boolean }
   */
  constructor(cdp, sink, { fps = 60, format = 'png', audio = true } = {}) {
    this.#cdp = cdp
    this.#sink = sink
    this.fps = fps
    this.format = format
    this.audio = audio
  }

  get cdp() {
    return this.#cdp
  }

  /** Frames recorded so far. */
  get frames() {
    return this.#index
  }

  /** Video time so far, in seconds. */
  get time() {
    return this.#index / this.fps
  }

  /** Run renderer code with `capture` (lib/oscine.mjs helpers) in scope. */
  eval(body, timeoutMs = 30_000) {
    return this.#cdp.evaluate(`const capture = window.__oscineCapture; ${body}`, timeoutMs)
  }

  /**
   * Install the virtual clock and record frame 0. `prepare` runs in between,
   * with time (and audio) frozen: the place for state that must be exact on
   * every run, like the playback position.
   */
  async start(prepare) {
    await this.#cdp.evaluate(`${clockSource}; ${LOCATE_SOURCE}; return true;`)
    const result = await this.#cdp.evaluate(
      `return window.__captureClock.install({ fps: ${this.fps}, audio: ${this.audio} })`,
      15_000
    )
    this.#installed = true
    if (prepare) await prepare(this)
    await this.#frame()
    return result
  }

  async stop() {
    if (!this.#installed) return null
    this.#installed = false
    return this.#cdp.evaluate(`return window.__captureClock.uninstall()`, 15_000)
  }

  async #frame() {
    const step = await this.#cdp.evaluate(`return window.__captureClock.step(${this.#index})`, 30_000)
    if (!step.presented) {
      console.warn(`  frame ${this.#index}: no real compositor frame within 250 ms (window hidden?)`)
    }
    const shot = await this.#cdp.send(
      'Page.captureScreenshot',
      {
        format: this.format,
        ...(this.format === 'jpeg' ? { quality: 95 } : {}),
        fromSurface: true,
        captureBeyondViewport: false,
        optimizeForSpeed: true
      },
      60_000
    )
    if (!shot.data) throw new Error(`Page.captureScreenshot returned no data for frame ${this.#index}.`)
    await this.#sink(Buffer.from(shot.data, 'base64'), this.#index)
    this.#index++
  }

  /**
   * Record `seconds` of frames. `perFrame(p, i)` runs before each one, with
   * p going from 1/n to 1 — the state the frame should show.
   */
  async advance(seconds, perFrame) {
    const n = Math.max(0, Math.round(seconds * this.fps))
    for (let i = 1; i <= n; i++) {
      if (perFrame) await perFrame(i / n, i)
      await this.#frame()
    }
  }

  /** Record `seconds` with nothing driven but the app itself. */
  hold(seconds) {
    return this.advance(seconds)
  }

  /** Record frames until a renderer expression is truthy. */
  async until(expression, { timeout = 10, label = expression } = {}) {
    const limit = Math.round(timeout * this.fps)
    for (let i = 0; i < limit; i++) {
      if (await this.#cdp.evaluate(`const capture = window.__oscineCapture; return Boolean(${expression})`)) return
      await this.#frame()
    }
    throw new Error(`Timed out after ${timeout}s of video waiting for ${label}.`)
  }

  /** Record frames until a selector matches a visible element. */
  waitFor(selector, options = {}) {
    const s = JSON.stringify(selector)
    return this.until(
      `[...document.querySelectorAll(${s})].some((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; })`,
      { label: selector, ...options }
    )
  }

  /** Wait in real time, clock frozen, no frames: for loads the viewer should not watch. */
  async settle(expression, { timeout = 15, label = expression } = {}) {
    const deadline = Date.now() + timeout * 1000
    while (Date.now() < deadline) {
      if (await this.#cdp.evaluate(`const capture = window.__oscineCapture; return Boolean(${expression})`)) return
      await new Promise((r) => setTimeout(r, 50))
    }
    throw new Error(`Timed out after ${timeout}s waiting for ${label}.`)
  }

  locate(target) {
    return this.#cdp.evaluate(`return window.__oscineRecord.center(${JSON.stringify(target)})`)
  }

  async #mouse(type, x, y, extra = {}) {
    await this.#cdp.send('Input.dispatchMouseEvent', {
      type,
      x,
      y,
      pointerType: 'mouse',
      ...extra
    })
  }

  /** Move the (invisible) pointer: hover states follow it. */
  async hover(target, { seconds = 0, ease = 'inOut' } = {}) {
    const to = await this.locate(target)
    const from = this.pointer ?? to
    if (seconds > 0) {
      await this.advance(seconds, (p) => {
        const e = EASE[ease](p)
        return this.#mouse('mouseMoved', from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e)
      })
    } else {
      await this.#mouse('mouseMoved', to.x, to.y)
    }
    this.pointer = { x: to.x, y: to.y }
  }

  /** A real (trusted) click at the target's center, then `after` seconds of frames. */
  async click(target, { after = 0, button = 'left', clickCount = 1 } = {}) {
    const { x, y } = await this.locate(target)
    await this.#mouse('mouseMoved', x, y)
    await this.#mouse('mousePressed', x, y, { button, buttons: 1, clickCount })
    await this.#mouse('mouseReleased', x, y, { button, buttons: 0, clickCount })
    this.pointer = { x, y }
    if (after > 0) await this.hold(after)
  }

  /**
   * Press on a target and drag it by { dx, dy } (CSS px) over `seconds`,
   * recording the whole gesture.
   */
  async drag(target, { dx = 0, dy = 0, seconds = 1, ease = 'inOut' } = {}) {
    const from = await this.locate(target)
    await this.#mouse('mouseMoved', from.x, from.y)
    await this.#mouse('mousePressed', from.x, from.y, { button: 'left', buttons: 1, clickCount: 1 })
    await this.advance(seconds, (p) => {
      const e = EASE[ease](p)
      return this.#mouse('mouseMoved', from.x + dx * e, from.y + dy * e, { button: 'left', buttons: 1 })
    })
    await this.#mouse('mouseReleased', from.x + dx, from.y + dy, { button: 'left', buttons: 0, clickCount: 1 })
    this.pointer = { x: from.x + dx, y: from.y + dy }
  }

  /** Press a key (see KEYS, or a single character) with optional modifiers. */
  async key(name, { ctrl = false, shift = false, alt = false, meta = false, after = 0 } = {}) {
    const modifiers =
      (ctrl ? MODIFIERS.ctrl : 0) | (shift ? MODIFIERS.shift : 0) | (alt ? MODIFIERS.alt : 0) | (meta ? MODIFIERS.meta : 0)
    const known = KEYS[name]
    const single = !known && name.length === 1
    const upper = single ? name.toUpperCase() : null
    const info = known ?? {
      code: single && /[a-z]/i.test(name) ? `Key${upper}` : single && /\d/.test(name) ? `Digit${name}` : name,
      keyCode: single ? upper.charCodeAt(0) : 0,
      text: single ? name : undefined
    }
    const text = modifiers & (MODIFIERS.ctrl | MODIFIERS.meta | MODIFIERS.alt) ? undefined : info.text
    const base = { key: name, code: info.code, windowsVirtualKeyCode: info.keyCode, nativeVirtualKeyCode: info.keyCode, modifiers }
    await this.#cdp.send('Input.dispatchKeyEvent', { type: text ? 'keyDown' : 'rawKeyDown', ...base, ...(text ? { text, unmodifiedText: text } : {}) })
    await this.#cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base })
    if (after > 0) await this.hold(after)
  }

  /**
   * Type into a target at a human pace: `cps` characters a second, with a
   * fixed (so reproducible) wobble per character. Clicks the target first
   * unless `focus: false`; `clear: true` empties it first.
   */
  async type(target, text, { cps = 11, focus = true, clear = false } = {}) {
    if (focus && target) await this.click(target)
    if (clear) {
      await this.key('a', { ctrl: true })
      await this.key('Backspace')
    }
    const wobble = [1, 0.8, 1.25, 0.9, 1.1, 0.75, 1.3, 1, 0.85, 1.15]
    for (const [i, char] of [...text].entries()) {
      await this.#cdp.send('Input.insertText', { text: char })
      await this.hold(wobble[i % wobble.length] / cps)
    }
  }

  /**
   * Scroll a container (target or 'auto' — the page's largest) to `to`, or by
   * `by`, CSS px, over `seconds`. Positions are set per frame with
   * behavior: 'instant', so CSS smooth scrolling never runs on the real clock.
   */
  async scroll(target = 'auto', { to, by, seconds = 2, ease = 'inOut' } = {}) {
    const id = await this.#cdp.evaluate(`
      const r = window.__oscineRecord;
      r.scrollers.push(r.scroller(${JSON.stringify(target)}));
      return r.scrollers.length - 1;
    `)
    const from = await this.#cdp.evaluate(`return window.__oscineRecord.scrollers[${id}].scrollTop`)
    const end = to ?? from + (by ?? 0)
    await this.advance(seconds, (p) =>
      this.#cdp.evaluate(
        `window.__oscineRecord.scrollers[${id}].scrollTo({ top: ${from + (end - from) * EASE[ease](p)}, behavior: 'instant' }); return true;`
      )
    )
  }

  // ---------------------------------------------------------------- Oscine

  /** Navigate to a route by name. */
  async route(name, { after = 0 } = {}) {
    await this.eval(`await capture.route(${JSON.stringify(name)}); return true;`)
    if (after > 0) await this.hold(after)
  }

  /** Switch theme live (name, 'dark' | 'light'). */
  async theme(name, mode = 'dark', { after = 0 } = {}) {
    await this.eval(`await capture.setTheme(${JSON.stringify(name)}, ${JSON.stringify(mode)}); return true;`)
    if (after > 0) await this.hold(after)
  }

  /** Open the command palette (optionally typing a query into it). */
  async palette(query, { cps, after = 0 } = {}) {
    await this.eval(`capture.store('palette').openPalette(); return true;`)
    await this.waitFor('[role="dialog"] input')
    if (query) await this.type(null, query, { cps, focus: false })
    if (after > 0) await this.hold(after)
  }

  /** Show the stage visualizer with an effect, or hide it with `false`. */
  async visualizer(effect, { after = 0 } = {}) {
    await this.eval(`
      const viz = capture.store('visualizer');
      if (${JSON.stringify(effect)}) viz.select(${JSON.stringify(effect || '')});
      if (viz.wanted !== ${Boolean(effect)}) viz.toggle();
      return true;
    `)
    if (after > 0) await this.hold(after)
  }

  /** Open the Tunedeck on a tab ('artist' | 'track' | 'related' | 'playing'), or close it. */
  async tunedeck(tab, { after = 0 } = {}) {
    await this.eval(`
      const deck = capture.store('tunedeck');
      deck.open = ${Boolean(tab)};
      if (${JSON.stringify(tab)}) deck.selectTab(${JSON.stringify(tab || '')});
      return true;
    `)
    if (after > 0) await this.hold(after)
  }

  /**
   * Play a library track matched by title (and optionally album/artist),
   * queueing the rest of its album after it. Loading happens with the clock
   * frozen, so the cut is clean.
   */
  async play({ title, album, artist, at = 0 } = {}, { after = 0 } = {}) {
    await this.eval(
      `
      const page = await capture.unwrap(window.oscine.library.listTracks({
        sort: 'album', direction: 'asc', offset: 0, limit: 5000
      }));
      const want = ${JSON.stringify({ title, album, artist })};
      const match = (t) => (!want.title || t.title === want.title) && (!want.album || t.album === want.album) && (!want.artist || t.artist === want.artist);
      const index = page.tracks.findIndex(match);
      if (index < 0) throw new Error('No track matches ' + JSON.stringify(want));
      const lead = page.tracks[index];
      const rest = page.tracks.filter((t, i) => i !== index && t.albumId === lead.albumId);
      const playback = capture.store('playback');
      await playback.playTracks({ tracks: [lead, ...rest], index: 0 });
      if (${at} > 0) playback.seek(${at});
      return true;
    `,
      60_000
    )
    await this.settle(`capture.store('playback').isPlaying`, { label: 'playback to start' })
    if (after > 0) await this.hold(after)
  }

  /**
   * Drag an EQ band handle on Tools → Equalizer by { dx, dy } CSS px
   * (right = higher frequency, up = more gain). `band` is the handle index.
   */
  eqDrag(band, { dx = 0, dy = 0, seconds = 1.2, ease = 'inOut' } = {}) {
    return this.drag(
      { selector: '[aria-label="Equalizer response curve"] [role="slider"]', index: band },
      { dx, dy, seconds, ease }
    )
  }
}
