/*
 * clock.js — a virtual clock for lockstep video capture. Injected into the
 * renderer's main world by record.mjs (as source text, over CDP); never part
 * of the app bundle.
 *
 * While installed, the page's sense of time only moves when the recorder says
 * so, one output frame at a time:
 *
 *   requestAnimationFrame / cancelAnimationFrame   queued; run once per step
 *                                                  with the virtual timestamp
 *   performance.now                                virtual
 *   setTimeout / setInterval (+ clear*)            virtual: due timers run in
 *                                                  order as the clock advances
 *   CSS animations / transitions / WAAPI           paused and seeked by dt
 *   the AudioContext feeding playback              suspended; resumed each step
 *                                                  just long enough to reach
 *                                                  the frame's audio time
 *
 * Date.now and requestIdleCallback stay real. Work scheduled before install
 * (an interval already running, a rAF already queued) runs on the real clock.
 *
 * The originals are kept on `__captureClock.real` so the capture helpers can
 * still wait for real frames while the page is frozen.
 */
;(() => {
  if (window.__captureClock) return

  const real = {
    raf: window.requestAnimationFrame.bind(window),
    caf: window.cancelAnimationFrame.bind(window),
    now: performance.now.bind(performance),
    setTimeout: window.setTimeout.bind(window),
    clearTimeout: window.clearTimeout.bind(window),
    setInterval: window.setInterval.bind(window),
    clearInterval: window.clearInterval.bind(window)
  }

  // Ids well above anything the real timer/rAF tables hand out, so a clear*
  // call can tell a virtual id from a real one scheduled before install.
  const ID_BASE = 1_000_000_000

  /** A macrotask boundary: lets every pending microtask (Vue, promises) drain. */
  const yieldTask = () =>
    new Promise((resolveYield) => {
      const channel = new MessageChannel()
      channel.port1.onmessage = () => {
        channel.port1.close()
        resolveYield()
      }
      channel.port2.postMessage(0)
    })

  /** Resolves after `count` real compositor frames, or `timeoutMs`, whichever first. */
  const realFrames = (count = 2, timeoutMs = 250) =>
    new Promise((resolveFrames) => {
      let left = count
      let done = false
      const finish = (timedOut) => {
        if (done) return
        done = true
        resolveFrames(!timedOut)
      }
      const tick = () => {
        if (--left <= 0) finish(false)
        else real.raf(tick)
      }
      real.raf(tick)
      real.setTimeout(() => finish(true), timeoutMs)
    })

  let installed = false
  let virtualNow = 0
  let startNow = 0
  let nextId = ID_BASE
  let rafQueue = []
  const timers = new Map()
  const owned = new Set() // animations this clock paused and drives
  let audio = null // { context, startTime, overshoots: [] }
  let frameIndex = 0
  let fps = 60
  let errors = []

  const report = (where, error) => {
    errors.push(`${where}: ${error?.stack ?? error}`)
    console.error(`[capture clock] ${where}`, error)
  }

  function virtualSetTimeout(fn, delay = 0, ...args) {
    const id = ++nextId
    timers.set(id, { at: virtualNow + Math.max(0, Number(delay) || 0), fn, args, every: null })
    return id
  }

  function virtualSetInterval(fn, delay = 0, ...args) {
    const id = ++nextId
    const every = Math.max(1, Number(delay) || 0)
    timers.set(id, { at: virtualNow + every, fn, args, every })
    return id
  }

  function virtualClear(id) {
    if (timers.delete(id)) return
    if (typeof id === 'number' && id <= ID_BASE) real.clearTimeout(id)
  }

  function virtualRaf(fn) {
    const id = ++nextId
    rafQueue.push({ id, fn })
    return id
  }

  function virtualCaf(id) {
    const before = rafQueue.length
    rafQueue = rafQueue.filter((entry) => entry.id !== id)
    if (rafQueue.length === before && typeof id === 'number' && id <= ID_BASE) real.caf(id)
  }

  /** Run every timer due at or before `target`, in due order, draining microtasks between them. */
  async function runTimersUntil(target) {
    for (;;) {
      let dueId = null
      let due = null
      for (const [id, timer] of timers) {
        if (timer.at <= target && (due === null || timer.at < due.at)) {
          dueId = id
          due = timer
        }
      }
      if (due === null) break
      virtualNow = Math.max(virtualNow, due.at)
      if (due.every === null) timers.delete(dueId)
      else due.at += due.every
      try {
        if (typeof due.fn === 'function') due.fn(...due.args)
        else (0, eval)(String(due.fn))
      } catch (error) {
        report('timer', error)
      }
      await yieldTask()
    }
    virtualNow = target
  }

  function runAnimationFrames(timestamp) {
    const queue = rafQueue
    rafQueue = []
    for (const { fn } of queue) {
      try {
        fn(timestamp)
      } catch (error) {
        report('requestAnimationFrame', error)
      }
    }
  }

  /**
   * Take over every running animation the clock does not own yet.
   *
   * At install, whatever is mid-flight keeps its progress (it began on the
   * real clock; nothing better is known). After that, an animation is new in
   * virtual time: it began at the current virtual instant, so it starts from
   * its first frame. Keeping the real milliseconds it had already run — which
   * vary with how long a screenshot took — is what made frames differ between
   * otherwise identical runs.
   */
  function adoptAnimations({ restart }) {
    for (const animation of document.getAnimations()) {
      if (owned.has(animation) || animation.playState !== 'running') continue
      animation.pause()
      if (restart) {
        try {
          animation.currentTime = 0
        } catch (error) {
          report('animation', error)
        }
      }
      owned.add(animation)
    }
  }

  /** Seek every owned animation forward by dt, finishing the ones that end. */
  function advanceAnimations(dtMs) {
    const live = new Set(document.getAnimations())
    for (const animation of owned) {
      if (!live.has(animation) || animation.playState === 'idle' || animation.playState === 'finished') {
        owned.delete(animation)
        continue
      }
      // The app played it again itself since the last step.
      if (animation.playState === 'running') animation.pause()
      const timing = animation.effect?.getComputedTiming?.()
      const end = timing?.endTime ?? Infinity
      const rate = animation.playbackRate || 1
      const next = (animation.currentTime ?? 0) + dtMs * rate
      try {
        if (Number.isFinite(end) && rate > 0 && next >= end) {
          animation.finish()
          owned.delete(animation)
        } else {
          animation.currentTime = next
        }
      } catch (error) {
        report('animation', error)
        owned.delete(animation)
      }
    }
  }

  /**
   * Advance the audio clock to the frame's time, then freeze it again.
   *
   * The context renders in bursts (512 frames at 48 kHz here), so it stops up
   * to one burst past the target; the next target is absolute, so that never
   * accumulates. If something resumed the context behind the clock's back
   * (the engine resumes a suspended context when a new track starts), the
   * audio ran ahead in real time: re-anchor so it continues from where it is.
   */
  async function stepAudio(index) {
    if (!audio) return
    const { context } = audio
    if (context.state === 'closed') {
      audio = null
      return
    }
    let target = audio.startTime + index / fps
    if (context.currentTime - target > 2 / fps) {
      if (context.state === 'running') await context.suspend()
      audio.startTime += context.currentTime - target
      audio.reanchors++
      target = audio.startTime + index / fps
    }
    if (context.currentTime < target) {
      if (context.state !== 'running') await context.resume()
      const deadline = real.now() + 1000
      while (context.currentTime < target && real.now() < deadline) {
        await new Promise((resolveWait) => real.setTimeout(resolveWait, 1))
      }
    }
    if (context.state === 'running') await context.suspend()
    audio.overshoots.push(context.currentTime - target)
  }

  /**
   * Adopt the AudioContext that playback renders through. The engine keeps it
   * private, but reads `currentTime` from a ticker while a track plays and
   * calls `createBufferSource` whenever one starts, so hooks on both catch it
   * — now if something is playing, or the moment playback starts later.
   */
  const hooks = []
  function hookPlaybackContext() {
    const proto = BaseAudioContext.prototype
    const timeDescriptor = Object.getOwnPropertyDescriptor(proto, 'currentTime')
    const createSource = proto.createBufferSource
    const restore = () => {
      Object.defineProperty(proto, 'currentTime', timeDescriptor)
      proto.createBufferSource = createSource
    }
    const adopt = (context) => {
      if (audio || !installed || !(context instanceof AudioContext)) return
      restore()
      audio = {
        context,
        startTime: timeDescriptor.get.call(context) - frameIndex / fps,
        overshoots: [],
        reanchors: 0
      }
      if (context.state === 'running') void context.suspend()
    }
    Object.defineProperty(proto, 'currentTime', {
      configurable: true,
      enumerable: timeDescriptor.enumerable,
      get() {
        if (this.state === 'running') adopt(this)
        return timeDescriptor.get.call(this)
      }
    })
    proto.createBufferSource = function (...args) {
      adopt(this)
      return createSource.apply(this, args)
    }
    hooks.push(restore)
  }

  /** Give a playing engine's ticker a moment to read `currentTime`. */
  async function waitForAudio(timeoutMs) {
    const deadline = real.now() + timeoutMs
    while (!audio && real.now() < deadline) {
      await new Promise((resolveWait) => real.setTimeout(resolveWait, 20))
    }
  }

  async function install(options = {}) {
    if (installed) throw new Error('The capture clock is already installed.')
    fps = options.fps ?? 60
    errors = []
    frameIndex = 0
    startNow = virtualNow = real.now()
    nextId = ID_BASE
    rafQueue = []
    timers.clear()
    owned.clear()

    audio = null
    installed = true
    if (options.audio !== false) {
      hookPlaybackContext()
      // Playing already: the ticker reads currentTime within a few hundred ms.
      await waitForAudio(options.audioWaitMs ?? 1500)
      if (audio?.context.state === 'running') await audio.context.suspend()
      if (audio) audio.startTime = audio.context.currentTime
    }

    window.requestAnimationFrame = virtualRaf
    window.cancelAnimationFrame = virtualCaf
    performance.now = () => virtualNow
    window.setTimeout = virtualSetTimeout
    window.setInterval = virtualSetInterval
    window.clearTimeout = virtualClear
    window.clearInterval = virtualClear
    // Freeze whatever is animating right now at its current position.
    adoptAnimations({ restart: false })
    return { audio: Boolean(audio), audioTime: audio?.startTime ?? null }
  }

  /**
   * Advance to output frame `index` (frame 0 is the install instant) and wait
   * for the compositor to present it. Returns once a screenshot will show it.
   *
   * Order matters for reproducibility. Animations started by the recorder's
   * actions since the last frame began at the previous instant, so they are
   * adopted from their first frame and advance with the rest; animations
   * started by this frame's timers and callbacks begin now and show their
   * first frame. (`getAnimations()` flushes style, so a class change made a
   * moment ago already has its transition.)
   */
  async function step(index) {
    if (!installed) throw new Error('The capture clock is not installed.')
    const target = startNow + (index * 1000) / fps
    const dt = target - virtualNow
    adoptAnimations({ restart: true })
    advanceAnimations(dt)
    await stepAudio(index)
    await runTimersUntil(target)
    await yieldTask()
    runAnimationFrames(target)
    await yieldTask()
    adoptAnimations({ restart: true })
    frameIndex = index
    const presented = await realFrames(2)
    return { index, now: target - startNow, presented }
  }

  /** Put the real clock back; anything still pending moves over to it. */
  async function uninstall() {
    if (!installed) return summary()
    window.requestAnimationFrame = real.raf
    window.cancelAnimationFrame = real.caf
    delete performance.now
    window.setTimeout = real.setTimeout
    window.setInterval = real.setInterval
    window.clearTimeout = real.clearTimeout
    window.clearInterval = real.clearInterval
    installed = false
    while (hooks.length) hooks.pop()()

    for (const { fn } of rafQueue) real.raf(fn)
    rafQueue = []
    for (const timer of timers.values()) {
      const delay = Math.max(0, timer.at - virtualNow)
      if (timer.every === null) real.setTimeout(timer.fn, delay, ...timer.args)
      else real.setTimeout(() => real.setInterval(timer.fn, timer.every, ...timer.args), delay)
    }
    timers.clear()
    for (const animation of owned) {
      try {
        animation.play()
      } catch {}
    }
    owned.clear()
    if (audio) await audio.context.resume()
    return summary()
  }

  function summary() {
    const overshoots = audio?.overshoots ?? []
    const ms = overshoots.map((value) => value * 1000)
    return {
      frames: frameIndex + 1,
      virtualMs: virtualNow - startNow,
      errors,
      audio: audio
        ? {
            sampleRate: audio.context.sampleRate,
            baseLatency: audio.context.baseLatency,
            overshootMs: {
              mean: ms.reduce((sum, value) => sum + value, 0) / Math.max(1, ms.length),
              max: Math.max(0, ...ms),
              p95: [...ms].sort((a, b) => a - b)[Math.floor(ms.length * 0.95)] ?? 0
            },
            stalledFrames: ms.filter((value, i) => i > 0 && value > 1000 / fps).length,
            reanchors: audio.reanchors
          }
        : null
    }
  }

  window.__captureClock = {
    install,
    step,
    uninstall,
    summary,
    real,
    realFrames,
    get now() {
      return virtualNow - startNow
    },
    get installed() {
      return installed
    }
  }
})()
