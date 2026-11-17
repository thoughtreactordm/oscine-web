/**
 * oscine.mjs — what shoot.mjs and record.mjs share: launching Oscine in the
 * throwaway profile, a dependency-free CDP session, the renderer helpers, and
 * the library/state setup every shot and every flow starts from.
 *
 * Renderer setters used by the recipes
 * ------------------------------------
 * Vue leaves the mounted app on `#app.__vue_app__`; its `$pinia._s` map is the
 * least invasive way for a development-only CDP client to reach the real stores.
 * The scripts use these public store verbs/properties and no app patch:
 *
 *   route/view          `$router.push({ name })`
 *   theme               `theme.themeName` plus the durable `theme.mode` bridge
 *   Tunedeck            `tunedeck.open`, `tunedeck.selectTab(tab)`
 *   palette             `palette.openPalette()`
 *   Quick Menu          `shell.requestQuickMenu()` on the Now Playing route
 *   Stage / Zen         Now Playing route; `zen.active` for chromeless Zen
 *   visualizer          `visualizer.select(id)`, `visualizer.toggle()`
 *   track info          `trackInfo.show(track)`
 *   Tools review        `tagWriteback.reviewPending()`
 *   onboarding          `onboarding.openWizard()` / `.close()`
 *
 * Library registration is the one state change that cannot go through a store:
 * `library.addRoot` deliberately owns a native folder picker. Node 24's built-in
 * SQLite registers the known throwaway path in the throwaway database, after
 * which `libraryRoots.rescan(id)` drives the app's normal scanner. Nothing here
 * opens or mutates the operator's real profile.
 */

import { spawn } from 'node:child_process'
import { access, mkdir, readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import { seedCaptureState } from '../seed-state.mjs'

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

/** The capture viewport: CSS pixels, before the 2× device scale. */
export const VIEWPORT = Object.freeze({ width: 1280, height: 820, deviceScaleFactor: 2 })

/** A gentle warm-and-bright curve: something a listener would actually keep. */
export const EQ_CURVE = Object.freeze([
  { type: 'lowshelf', frequencyHz: 105, gainDb: 3.5, q: 0.71 },
  { type: 'peaking', frequencyHz: 240, gainDb: -2, q: 1.1 },
  { type: 'peaking', frequencyHz: 1200, gainDb: -1, q: 1.4 },
  { type: 'peaking', frequencyHz: 3200, gainDb: 2, q: 1.6 },
  { type: 'peaking', frequencyHz: 6500, gainDb: -2.5, q: 3.5 },
  { type: 'highshelf', frequencyHz: 10500, gainDb: 3, q: 0.71 }
])

export const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms))

export async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

/** Every path the tools derive from `--app-dir` and `--capture-root`. */
export function capturePaths({ appDir, captureRoot } = {}) {
  const root = resolve(captureRoot ?? join(homedir(), 'oscine-capture'))
  const configHome = join(root, 'config')
  return {
    appDir: resolve(appDir ?? join(repoRoot, '..', 'oscine')),
    captureRoot: root,
    configHome,
    libraryDir: join(root, 'library'),
    manifestFile: join(root, 'manifest.json'),
    databaseFile: join(configHome, 'oscine', 'library.db')
  }
}

export async function readManifest(paths) {
  try {
    return JSON.parse(await readFile(paths.manifestFile, 'utf8'))
  } catch {
    return { library: paths.libraryDir, podcasts: [] }
  }
}

/** One dependency-free CDP page session. */
export class CdpSession {
  #socket
  #nextId = 0
  #pending = new Map()
  #listeners = new Map()

  constructor(socket) {
    this.#socket = socket
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.id === undefined) {
        for (const listener of this.#listeners.get(message.method) ?? []) listener(message.params ?? {})
        return
      }
      const pending = this.#pending.get(message.id)
      if (!pending) return
      this.#pending.delete(message.id)
      clearTimeout(pending.timer)
      if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`))
      else pending.resolve(message.result ?? {})
    }
    socket.onclose = () => {
      for (const pending of this.#pending.values()) {
        clearTimeout(pending.timer)
        pending.reject(new Error('The renderer debugger closed.'))
      }
      this.#pending.clear()
    }
  }

  send(method, params = {}, timeoutMs = 20_000) {
    const id = ++this.#nextId
    return new Promise((resolveSend, reject) => {
      const timer = setTimeout(() => {
        this.#pending.delete(id)
        reject(new Error(`${method} timed out after ${timeoutMs} ms.`))
      }, timeoutMs)
      this.#pending.set(id, { method, resolve: resolveSend, reject, timer })
      this.#socket.send(JSON.stringify({ id, method, params }))
    })
  }

  /** Subscribe to a CDP event; returns the unsubscribe. */
  on(method, listener) {
    const set = this.#listeners.get(method) ?? new Set()
    set.add(listener)
    this.#listeners.set(method, set)
    return () => set.delete(listener)
  }

  async evaluate(body, timeoutMs = 30_000) {
    const result = await this.send(
      'Runtime.evaluate',
      {
        expression: `(async () => { ${body} })()`,
        awaitPromise: true,
        returnByValue: true,
        includeCommandLineAPI: true,
        userGesture: true
      },
      timeoutMs
    )
    if (result.exceptionDetails) {
      const detail = result.exceptionDetails
      throw new Error(detail.exception?.description ?? detail.text ?? 'Renderer evaluation failed.')
    }
    return result.result?.value
  }

  close() {
    this.#socket.close()
  }
}

async function rendererTarget(endpoint) {
  const response = await fetch(`${endpoint}/json/list`)
  if (!response.ok) throw new Error(`CDP target list returned HTTP ${response.status}.`)
  const targets = await response.json()
  return targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl)
}

async function waitForRenderer(endpoint, child, logTail) {
  const deadline = Date.now() + 90_000
  let lastError = null
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Oscine exited before its renderer was ready (code ${child.exitCode}).\n${logTail()}`)
    }
    try {
      const target = await rendererTarget(endpoint)
      if (target) return target
    } catch (error) {
      lastError = error
    }
    await sleep(150)
  }
  throw new Error(`Timed out waiting for Oscine at ${endpoint}: ${lastError?.message ?? 'no page target'}\n${logTail()}`)
}

async function connect(url) {
  const socket = new WebSocket(url)
  await new Promise((resolveOpen, reject) => {
    socket.onopen = resolveOpen
    socket.onerror = () => reject(new Error(`Could not open ${url}`))
  })
  return new CdpSession(socket)
}

export async function waitUntil(cdp, expression, label, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs
  let last = null
  while (Date.now() < deadline) {
    try {
      // Predicates often finish with a DOM/Vue object (`a && b`). Coerce in the
      // renderer so CDP never tries to clone a proxy graph by value.
      last = await cdp.evaluate(`return Boolean(${expression})`)
      if (last) return last
    } catch (error) {
      last = error.message
    }
    await sleep(100)
  }
  throw new Error(`Timed out waiting for ${label}${last ? ` (last result: ${JSON.stringify(last)})` : ''}.`)
}

/**
 * Launch `npm run dev` in the throwaway profile with a debugger port, connect
 * to the renderer, pin the viewport and install the helpers.
 *
 * Returns `{ cdp, endpoint, logTail, stop, detach }`. Call `stop()` when done
 * (or `detach()` to leave the app running). SIGINT/SIGTERM stop it too.
 */
export async function launchOscine({ paths, port, electronArgs = [], viewport = VIEWPORT }) {
  const endpoint = `http://127.0.0.1:${port}`
  try {
    const response = await fetch(`${endpoint}/json/list`)
    if (response.ok) throw new Error(`A debugger is already using ${endpoint}. Close it or pass --port.`)
  } catch (error) {
    if (error.message.startsWith('A debugger is already')) throw error
  }
  if (!(await exists(join(paths.appDir, 'package.json')))) {
    throw new Error(`No Oscine checkout at ${paths.appDir}. Pass --app-dir DIR.`)
  }
  await mkdir(paths.configHome, { recursive: true })

  const appLog = []
  const remember = (chunk) => {
    appLog.push(...String(chunk).split(/\r?\n/).filter(Boolean))
    if (appLog.length > 80) appLog.splice(0, appLog.length - 80)
  }
  const logTail = () => appLog.slice(-30).join('\n')

  console.log(`Launching Oscine with XDG_CONFIG_HOME=${paths.configHome}`)
  const child = spawn(
    'npm',
    ['run', 'dev', '--', '--', `--remote-debugging-port=${port}`, ...electronArgs],
    {
      cwd: paths.appDir,
      env: { ...process.env, XDG_CONFIG_HOME: paths.configHome },
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe']
    }
  )
  child.stdout.on('data', remember)
  child.stderr.on('data', remember)

  const stop = () => {
    if (child.exitCode !== null || child.killed) return
    try {
      if (process.platform === 'win32') child.kill('SIGTERM')
      else process.kill(-child.pid, 'SIGTERM')
    } catch {
      child.kill('SIGTERM')
    }
  }
  process.once('SIGINT', () => {
    stop()
    process.exitCode = 130
  })
  process.once('SIGTERM', () => stop())

  const detach = () => {
    child.stdout.unref?.()
    child.stderr.unref?.()
    child.unref()
  }

  try {
    const target = await waitForRenderer(endpoint, child, logTail)
    const cdp = await connect(target.webSocketDebuggerUrl)
    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: viewport.deviceScaleFactor,
      mobile: false,
      screenWidth: viewport.width,
      screenHeight: viewport.height,
      positionX: 0,
      positionY: 0,
      dontSetVisibleSize: false
    })
    await waitUntil(
      cdp,
      `document.readyState === 'complete' && document.querySelector('#app')?.__vue_app__`,
      'the Vue renderer',
      60_000
    )
    await installRendererHelpers(cdp)
    return { cdp, endpoint, logTail, stop, detach }
  } catch (error) {
    if (logTail()) error.message += `\n\nOscine log tail:\n${logTail()}`
    stop()
    throw error
  }
}

/**
 * Make helpers available to every recipe. This is renderer-memory only and is
 * replaced on every launch; the shipped app and its sources remain untouched.
 */
export async function installRendererHelpers(cdp) {
  await cdp.evaluate(`
    const app = document.querySelector('#app')?.__vue_app__;
    const pinia = app?.config?.globalProperties?.$pinia;
    const router = app?.config?.globalProperties?.$router;
    if (!pinia || !router) throw new Error('Vue/Pinia/router are not mounted yet.');

    const store = (id) => {
      const value = pinia._s.get(id);
      if (!value) throw new Error('Pinia store is not mounted: ' + id);
      return value;
    };
    const unwrap = async (promise) => {
      const result = await promise;
      if (!result?.ok) throw new Error(result?.error?.message || 'IPC request failed.');
      return result.value;
    };
    // Bound now, before record.mjs's virtual clock can replace the global: a
    // helper that waits for frames must wait for real ones.
    const raf = window.__captureClock?.real.raf ?? window.requestAnimationFrame.bind(window);
    const nextFrames = async (count = 2) => {
      for (let i = 0; i < count; i++) await new Promise(raf);
    };
    const route = async (name, query) => {
      await router.push({ name, ...(query ? { query } : {}) });
      await nextFrames(2);
    };
    const click = (label) => {
      const wanted = label.trim();
      const nodes = [...document.querySelectorAll('button, [role="button"]')];
      const node = nodes.find((candidate) =>
        candidate.getAttribute('aria-label')?.trim() === wanted ||
        candidate.textContent?.trim() === wanted
      );
      if (!node) throw new Error('Could not find control: ' + label);
      node.click();
      return true;
    };
    const setInput = (placeholder, value) => {
      const node = [...document.querySelectorAll('input')].find(
        (candidate) => candidate.getAttribute('placeholder') === placeholder
      );
      if (!node) throw new Error('Could not find input: ' + placeholder);
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(node, value);
      node.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    };
    const closeOverlays = async () => {
      pinia._s.get('palette')?.close?.();
      pinia._s.get('trackInfo')?.close?.();
      if (pinia._s.get('onboarding')?.open) pinia._s.get('onboarding').close();
      if (pinia._s.get('zen')) pinia._s.get('zen').active = false;
      if (pinia._s.get('tunedeck')) pinia._s.get('tunedeck').open = false;
      const quick = document.querySelector('[aria-label="Quick Menu"][aria-expanded="true"]');
      quick?.click();
      // Transient toasts (the post-scan ReplayGain nudge, mostly) are not part
      // of any shot or flow.
      for (const close of document.querySelectorAll('[role="region"] li[data-state="open"] button[aria-label="Close"]')) {
        close.click();
      }
      for (let i = 0; i < 3; i++) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await nextFrames(3);
    };
    const setTheme = async (themeName, mode) => {
      await unwrap(window.oscine.settings.set({ key: 'theme.name', value: themeName }));
      await unwrap(window.oscine.settings.set({ key: 'theme.mode', value: mode }));
      const theme = store('theme');
      theme.themeName = themeName;
      localStorage.setItem('vueuse-color-scheme', mode);
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'vueuse-color-scheme', newValue: mode, storageArea: localStorage
      }));
      await nextFrames(3);
    };
    window.__oscineCapture = { store, unwrap, route, click, setInput, nextFrames, closeOverlays, setTheme };
    return true;
  `)
}

function registerLibraryRoot(paths) {
  const db = new DatabaseSync(paths.databaseFile)
  try {
    db.exec('PRAGMA busy_timeout = 10000')
    const existing = db.prepare('SELECT id FROM roots WHERE path = ?').get(paths.libraryDir)
    if (existing) return Number(existing.id)
    const result = db
      .prepare('INSERT INTO roots (label, path, added_at, last_scan_at) VALUES (?, ?, ?, NULL)')
      .run(basename(paths.libraryDir), paths.libraryDir, Date.now())
    return Number(result.lastInsertRowid)
  } finally {
    db.close()
  }
}

export async function ensureLibrary(cdp, paths) {
  if (!(await exists(paths.libraryDir))) {
    throw new Error(`No capture library at ${paths.libraryDir}. Run node tools/capture/make-library.mjs first.`)
  }
  if (!(await exists(paths.databaseFile))) {
    throw new Error(`Oscine did not create its throwaway database at ${paths.databaseFile}.`)
  }
  const rootId = registerLibraryRoot(paths)
  console.log(`Scanning ${paths.libraryDir}…`)
  const summary = await cdp.evaluate(`
    const roots = window.__oscineCapture.store('libraryRoots');
    await roots.refresh();
    await roots.rescan(${rootId});
    await roots.refresh();
    // Claim the post-scan "N tracks have no ReplayGain" nudge before the app's
    // settle timer asks: asking records the answer, so the app's own ask gets
    // null and the toast never appears in a shot or a clip.
    await window.__oscineCapture.store('replayGain').nudgeAfterScan();
    const page = await window.__oscineCapture.unwrap(window.oscine.library.listTracks({
      sort: 'artist', direction: 'asc', offset: 0, limit: 1
    }));
    return { roots: roots.roots.length, tracks: page.total, notice: roots.notice };
  `, 180_000)
  if (!summary || summary.tracks === 0) {
    throw new Error(`The capture library scan produced no tracks${summary?.notice ? `: ${summary.notice}` : '.'}`)
  }
  console.log(`Library ready: ${summary.tracks} tracks.`)
}

/**
 * Play the capture lead with a fixed queue behind it, at 70% volume, seeked
 * near its end (where the screenshots want the progress bar).
 */
export async function ensurePlaying(cdp, captureLeadTrackId) {
  return cdp.evaluate(`
    const capture = window.__oscineCapture;
    const playback = capture.store('playback');
    const [lead] = await capture.unwrap(window.oscine.library.getTracksByIds({
      ids: [${captureLeadTrackId}]
    }));
    if (!lead) throw new Error('The designated capture lead is not playable.');
    const page = await capture.unwrap(window.oscine.library.listTracks({
      sort: 'artist', direction: 'asc', offset: 0, limit: 13
    }));
    if (page.tracks.length < 13) throw new Error('The capture queue needs at least 13 playable tracks.');
    playback.clearQueue();
    await playback.playTracks({ tracks: [lead, ...page.tracks.slice(0, 10)], index: 0 });
    playback.enqueueNext(page.tracks.slice(10, 12));
    playback.setVolume(0.7);
    if (playback.duration > 0) playback.seek(Math.min(Math.max(0, playback.duration - 5), 70));
    if (!playback.isPlaying) await playback.resume();
    const deadline = Date.now() + 10_000;
    while (playback.queuedSessionCount < 10 && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    await capture.nextFrames(4);
    return {
      id: playback.nowPlaying?.id,
      title: playback.nowPlaying?.title,
      playing: playback.isPlaying,
      volume: playback.volume,
      userQueue: playback.queuedUserCount,
      sessionQueue: playback.queuedSessionCount,
      queue: playback.queuedCount
    };
  `, 60_000)
}

/**
 * Seed listens/playlists/favourites and start the capture queue playing.
 * Returns the seed summary (including `captureLeadTrackId`).
 */
export async function ensureCaptureState(cdp, paths) {
  // Metadata edits are materialised into the live track/album rows as well as
  // recorded in track_overrides. Discard through Oscine before the direct DB
  // seed so a prior tools-writeback shot cannot leak into the next all-run.
  await cdp.evaluate(`
    await window.__oscineCapture.unwrap(window.oscine.overrides.discardAll());
    return true;
  `, 60_000)
  const durable = await seedCaptureState({
    captureRoot: paths.captureRoot,
    databaseFile: paths.databaseFile,
    libraryDir: paths.libraryDir
  })
  const runtime = await cdp.evaluate(`
    const capture = window.__oscineCapture;
    await capture.store('playlists').refresh();
    await capture.store('trackList').reload();
    return true;
  `)
  if (!runtime) throw new Error('The renderer did not refresh the seeded playlists.')
  const playing = await ensurePlaying(cdp, durable.captureLeadTrackId)
  if (!playing?.playing || playing.volume !== 0.7 || playing.userQueue !== 2 || playing.sessionQueue !== 10) {
    throw new Error(`Capture runtime state is incomplete: ${JSON.stringify(playing)}`)
  }
  console.log(
    `State ready: ${durable.listens} listens, ${durable.playlists} playlists, ` +
    `${durable.favorites} favorites, ${playing.userQueue}+${playing.sessionQueue} queued.`
  )
  return durable
}

export async function setBaseState(cdp) {
  await cdp.evaluate(`
    const capture = window.__oscineCapture;
    await capture.closeOverlays();
    await capture.setTheme('oscine', 'dark');
    // The EQ shot turns the equalizer on; every other shot is taken with it off.
    await capture.unwrap(window.oscine.settings.set({ key: 'audio.eq.enabled', value: false }));
    // Likewise the stage visualizer, which record.mjs flows switch on and the
    // profile remembers: Stage shots show the cover unless a recipe says so.
    const visualizer = capture.store('visualizer');
    if (visualizer.wanted) visualizer.toggle();
    await capture.route('library');
    return true;
  `)
}

export async function settle(cdp) {
  return cdp.evaluate(`
    if (document.fonts) await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 700));
    await window.__oscineCapture.nextFrames(3);
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      ready: document.readyState,
      fonts: document.fonts?.status ?? 'unsupported'
    };
  `)
}
