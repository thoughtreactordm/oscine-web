#!/usr/bin/env node
/**
 * shoot.mjs — launch Oscine in an isolated profile and capture the 2× masters.
 *
 *   node tools/capture/shoot.mjs <key>|--all [--keep-open]
 *
 * Optional overrides, mostly useful when debugging the capture tool itself:
 *
 *   --app-dir DIR       Oscine checkout (default: ../oscine)
 *   --capture-root DIR  generated library/profile root (default: ~/oscine-capture)
 *   --port N            remote debugging port (default: 9222)
 *   --out DIR           screenshot directory (default: src/assets/screenshots)
 *
 * Renderer setters used by the shot recipes
 * ------------------------------------------
 * Vue leaves the mounted app on `#app.__vue_app__`; its `$pinia._s` map is the
 * least invasive way for a development-only CDP client to reach the real stores.
 * The script uses these public store verbs/properties and no app patch:
 *
 *   route/view          `$router.push({ name })`
 *   theme               `theme.themeName` plus the durable `theme.mode` bridge
 *   Tunedeck            `tunedeck.open`, `tunedeck.selectTab(tab)`
 *   palette             `palette.openPalette()`
 *   Quick Menu          `shell.requestQuickMenu()` on the Now Playing route
 *   Stage / Zen         Now Playing route; `zen.active` for chromeless Zen
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
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { DatabaseSync } from 'node:sqlite'
import { seedCaptureState } from './seed-state.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..')

const SHOT_KEYS = Object.freeze([
  'library-hero',
  'tunedeck-artist',
  'tunedeck-track',
  'tunedeck-related',
  'tunedeck-playing',
  'theme-oscine-dark',
  'theme-oscine-light',
  'theme-nocturne',
  'theme-editor',
  'curate-discover',
  'stage',
  'zen',
  'stats',
  'podcasts',
  'tools-writeback',
  'palette',
  'quick-menu',
  'onboarding',
  'track-info',
  'tag-editor',
  'tools-equalizer',
  'tools-cdrip'
])

/** The album the CD rip shot stages as the disc in the drive. */
const RIP_ALBUM = 'A Catalogue of Absences'

/** A gentle warm-and-bright curve: something a listener would actually keep. */
const EQ_CURVE = [
  { type: 'lowshelf', frequencyHz: 105, gainDb: 3.5, q: 0.71 },
  { type: 'peaking', frequencyHz: 240, gainDb: -2, q: 1.1 },
  { type: 'peaking', frequencyHz: 1200, gainDb: -1, q: 1.4 },
  { type: 'peaking', frequencyHz: 3200, gainDb: 2, q: 1.6 },
  { type: 'peaking', frequencyHz: 6500, gainDb: -2.5, q: 3.5 },
  { type: 'highshelf', frequencyHz: 10500, gainDb: 3, q: 0.71 }
]

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    all: { type: 'boolean', default: false },
    'keep-open': { type: 'boolean', default: false },
    'app-dir': { type: 'string' },
    'capture-root': { type: 'string' },
    port: { type: 'string', default: '9222' },
    out: { type: 'string' },
    help: { type: 'boolean', short: 'h', default: false }
  }
})

function usage() {
  return [
    'Usage: node tools/capture/shoot.mjs <key>|--all [--keep-open]',
    '',
    'Shot keys:',
    ...SHOT_KEYS.map((key) => `  ${key}`),
    '',
    'Options:',
    '  --app-dir DIR       Oscine checkout (default: ../oscine)',
    '  --capture-root DIR  capture data root (default: ~/oscine-capture)',
    '  --port N            CDP port (default: 9222)',
    '  --out DIR           output directory (default: src/assets/screenshots)',
    '  --keep-open         leave the isolated app running after capture'
  ].join('\n')
}

if (values.help) {
  console.log(usage())
  process.exit(0)
}

const requested = values.all ? null : positionals[0]
if ((values.all && positionals.length > 0) || (!values.all && positionals.length !== 1)) {
  console.error(usage())
  process.exit(1)
}
if (requested !== null && !SHOT_KEYS.includes(requested)) {
  console.error(`Unknown shot key: ${requested}\n\n${usage()}`)
  process.exit(1)
}

const port = Number(values.port)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('--port must be an integer from 1 to 65535.')
  process.exit(1)
}

const captureRoot = resolve(values['capture-root'] ?? join(homedir(), 'oscine-capture'))
const appDir = resolve(values['app-dir'] ?? join(repoRoot, '..', 'oscine'))
const outputDir = resolve(values.out ?? join(repoRoot, 'src', 'assets', 'screenshots'))
const configHome = join(captureRoot, 'config')
const libraryDir = join(captureRoot, 'library')
const manifestFile = join(captureRoot, 'manifest.json')
const databaseFile = join(configHome, 'oscine', 'library.db')
const endpoint = `http://127.0.0.1:${port}`
// First in an all-run even though it is listed near the end of the public shot
// list: this is the one frame that belongs to the genuinely empty profile.
const keys = values.all
  ? ['onboarding', ...SHOT_KEYS.filter((key) => key !== 'onboarding')]
  : [requested]

const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms))

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function readManifest() {
  try {
    return JSON.parse(await readFile(manifestFile, 'utf8'))
  } catch {
    return { library: libraryDir, podcasts: [] }
  }
}

/** One dependency-free CDP page session. */
class CdpSession {
  #socket
  #nextId = 0
  #pending = new Map()

  constructor(socket) {
    this.#socket = socket
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
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

async function rendererTarget() {
  const response = await fetch(`${endpoint}/json/list`)
  if (!response.ok) throw new Error(`CDP target list returned HTTP ${response.status}.`)
  const targets = await response.json()
  return targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl)
}

async function waitForRenderer(child, logTail) {
  const deadline = Date.now() + 90_000
  let lastError = null
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Oscine exited before its renderer was ready (code ${child.exitCode}).\n${logTail()}`)
    }
    try {
      const target = await rendererTarget()
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

async function waitUntil(cdp, expression, label, timeoutMs = 30_000) {
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
 * Make helpers available to every recipe. This is renderer-memory only and is
 * replaced on every launch; the shipped app and its sources remain untouched.
 */
async function installRendererHelpers(cdp) {
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
    const nextFrames = async (count = 2) => {
      for (let i = 0; i < count; i++) await new Promise(requestAnimationFrame);
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

function registerLibraryRoot() {
  const db = new DatabaseSync(databaseFile)
  try {
    db.exec('PRAGMA busy_timeout = 10000')
    const existing = db.prepare('SELECT id FROM roots WHERE path = ?').get(libraryDir)
    if (existing) return Number(existing.id)
    const result = db
      .prepare('INSERT INTO roots (label, path, added_at, last_scan_at) VALUES (?, ?, ?, NULL)')
      .run(basename(libraryDir), libraryDir, Date.now())
    return Number(result.lastInsertRowid)
  } finally {
    db.close()
  }
}

async function ensureLibrary(cdp) {
  if (!(await exists(libraryDir))) {
    throw new Error(`No capture library at ${libraryDir}. Run node tools/capture/make-library.mjs first.`)
  }
  if (!(await exists(databaseFile))) {
    throw new Error(`Oscine did not create its throwaway database at ${databaseFile}.`)
  }
  const rootId = registerLibraryRoot()
  console.log(`Scanning ${libraryDir}…`)
  const summary = await cdp.evaluate(`
    const roots = window.__oscineCapture.store('libraryRoots');
    await roots.refresh();
    await roots.rescan(${rootId});
    await roots.refresh();
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

async function ensurePlaying(cdp, captureLeadTrackId) {
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

async function ensureCaptureState(cdp) {
  // Metadata edits are materialised into the live track/album rows as well as
  // recorded in track_overrides. Discard through Oscine before the direct DB
  // seed so a prior tools-writeback shot cannot leak into the next all-run.
  await cdp.evaluate(`
    await window.__oscineCapture.unwrap(window.oscine.overrides.discardAll());
    return true;
  `, 60_000)
  const durable = await seedCaptureState({ captureRoot, databaseFile, libraryDir })
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
}

async function setBaseState(cdp) {
  await cdp.evaluate(`
    const capture = window.__oscineCapture;
    await capture.closeOverlays();
    await capture.setTheme('oscine', 'dark');
    // The EQ shot turns the equalizer on; every other shot is taken with it off.
    await capture.unwrap(window.oscine.settings.set({ key: 'audio.eq.enabled', value: false }));
    await capture.route('library');
    return true;
  `)
}

async function subscribePodcasts(cdp, manifest) {
  const feeds = (manifest.podcasts ?? []).map((podcast) => podcast.feed).filter(Boolean)
  if (feeds.length === 0) return
  const reachable = await Promise.all(
    feeds.map(async (feed) => {
      try {
        const response = await fetch(feed)
        return response.ok ? feed : null
      } catch {
        return null
      }
    })
  )
  const online = reachable.filter(Boolean)
  if (online.length === 0) {
    console.warn('Podcast server is not reachable; the Podcasts shot will use existing subscriptions.')
    return
  }
  await cdp.evaluate(`
    const capture = window.__oscineCapture;
    const podcasts = capture.store('podcasts');
    await podcasts.refresh();
    const feeds = ${JSON.stringify(online)};
    for (const feed of feeds) {
      if (!podcasts.isSubscribedFeed(feed)) await podcasts.subscribe(feed);
    }
    await podcasts.refresh();
    if (podcasts.list[0]) podcasts.openTab(podcasts.list[0].id);
    await capture.nextFrames(3);
    return podcasts.list.length;
  `, 90_000)
}

async function prepareShot(cdp, key, manifest) {
  await setBaseState(cdp)

  if (key === 'onboarding') {
    await cdp.evaluate(`
      const capture = window.__oscineCapture;
      await capture.route('library');
      // Recreate the first-launch frame on a reused profile. The root itself is
      // still safely in SQLite and ensureLibrary refreshes these stores after
      // this shot; only the renderer projection is cleared for the dimmed page
      // behind the modal.
      const playback = capture.store('playback');
      playback.stop();
      playback.setVolume(1);
      const roots = capture.store('libraryRoots');
      roots.roots = [];
      const tracks = capture.store('trackList');
      tracks.total = 0;
      tracks.groups = [];
      tracks.loading = false;
      const browse = capture.store('browse');
      browse.artists.total.value = 0;
      browse.albums.total.value = 0;
      browse.genres.rows.value = [];
      capture.store('onboarding').openWizard();
      // OnboardingRootStep refreshes roots when it mounts. Let that one request
      // finish, then clear its projection too; no further refresh runs while
      // the first step stays mounted.
      await new Promise((resolve) => setTimeout(resolve, 250));
      roots.roots = [];
      tracks.total = 0;
      tracks.groups = [];
      browse.artists.total.value = 0;
      browse.albums.total.value = 0;
      browse.genres.rows.value = [];
      await capture.nextFrames(3);
    `)
    return
  }

  await cdp.evaluate(`
    const capture = window.__oscineCapture;
    const onboarding = capture.store('onboarding');
    if (onboarding.open) onboarding.close();
    await capture.unwrap(window.oscine.settings.set({
      key: 'interface.onboardingCompleted', value: true
    }));
  `)

  switch (key) {
    case 'library-hero':
      return
    case 'tunedeck-artist':
    case 'tunedeck-track':
    case 'tunedeck-related':
    case 'tunedeck-playing': {
      const tab = key.slice('tunedeck-'.length)
      await cdp.evaluate(`
        const capture = window.__oscineCapture;
        const deck = capture.store('tunedeck');
        deck.open = true;
        deck.selectTab(${JSON.stringify(tab)});
        await capture.nextFrames(5);
      `)
      return
    }
    case 'theme-oscine-dark':
      return
    case 'theme-oscine-light':
      await cdp.evaluate(`await window.__oscineCapture.setTheme('oscine', 'light')`)
      return
    case 'theme-nocturne':
      await cdp.evaluate(`await window.__oscineCapture.setTheme('nocturne', 'dark')`)
      return
    case 'theme-editor':
      await cdp.evaluate(`
        const capture = window.__oscineCapture;
        await capture.route('settings', { key: 'theme.overrides' });
        capture.store('settingsNav').reveal('theme.overrides');
        await capture.nextFrames(4);
        capture.click('Token overrides');
        await capture.nextFrames(4);
      `)
      return
    case 'curate-discover':
      await cdp.evaluate(`
        const capture = window.__oscineCapture;
        await capture.route('curate');
        capture.store('playlists').view(null);
        await capture.nextFrames(5);
      `)
      return
    case 'stage':
      await cdp.evaluate(`await window.__oscineCapture.route('now-playing')`)
      return
    case 'zen':
      await cdp.evaluate(`
        const capture = window.__oscineCapture;
        await capture.route('now-playing');
        capture.store('zen').active = true;
        await capture.nextFrames(4);
      `)
      return
    case 'stats':
      await cdp.evaluate(`await window.__oscineCapture.route('stats')`)
      return
    case 'podcasts':
      await cdp.evaluate(`await window.__oscineCapture.route('podcasts')`)
      await subscribePodcasts(cdp, manifest)
      return
    case 'tools-writeback':
      await cdp.evaluate(`
        const capture = window.__oscineCapture;
        const page = await capture.unwrap(window.oscine.library.listTracks({
          sort: 'artist', direction: 'asc', offset: 0, limit: 4
        }));
        for (const [index, track] of page.tracks.entries()) {
          await capture.unwrap(window.oscine.overrides.set([track.id], {
            title: index === 0
              ? track.title.replace(/(?: \\(single edit\\))+$/, '') + ' (single edit)'
              : track.title,
            year: 2026
          }));
        }
        await capture.route('tools');
        const review = capture.store('tagWriteback');
        await review.reviewPending();
        await capture.nextFrames(4);
      `, 60_000)
      return
    case 'palette':
      await cdp.evaluate(`
        const capture = window.__oscineCapture;
        capture.store('palette').openPalette();
        await capture.nextFrames(3);
        capture.setInput('Search everything…', 'premium');
        await new Promise((resolve) => setTimeout(resolve, 350));
        await capture.nextFrames(3);
      `)
      return
    case 'quick-menu':
      await cdp.evaluate(`
        const capture = window.__oscineCapture;
        await capture.route('now-playing');
        capture.store('shell').requestQuickMenu();
        await new Promise((resolve) => setTimeout(resolve, 650));
        await capture.nextFrames(3);
      `)
      return
    case 'track-info':
      await cdp.evaluate(`
        const capture = window.__oscineCapture;
        capture.store('trackInfo').show(capture.store('playback').nowPlaying);
        await capture.nextFrames(5);
        // 1.1 mirrors the editor's fields here, so the dialog scrolls. Lead with
        // Format and ReplayGain, which is what the Playback section talks about.
        const heading = [...document.querySelectorAll('[role="dialog"] *')].find(
          (node) => node.children.length === 0 && node.textContent?.trim().toLowerCase() === 'format'
        );
        if (!heading) throw new Error('Track info has no Format heading to scroll to.');
        heading.scrollIntoView({ block: 'start' });
        await new Promise((resolve) => setTimeout(resolve, 300));
        await capture.nextFrames(4);
      `)
      return
    case 'tag-editor':
      await cdp.evaluate(`
        const capture = window.__oscineCapture;
        const track = capture.store('playback').nowPlaying;
        await capture.store('trackEdit').edit(track.title, async () => [track.id]);
        await new Promise((resolve) => setTimeout(resolve, 400));
        await capture.nextFrames(3);
        // 1.1's editor covers every registered tag; open that section and bring
        // it into view so the shot shows more than the familiar core fields.
        capture.click('All fields');
        await capture.nextFrames(4);
        // Open one group so real fields show, not just seven collapsed headings.
        capture.click('Release');
        await capture.nextFrames(4);
        const section = [...document.querySelectorAll('button, [role="button"]')]
          .find((node) => node.textContent?.trim() === 'All fields');
        section?.scrollIntoView({ block: 'start' });
        await new Promise((resolve) => setTimeout(resolve, 300));
        await capture.nextFrames(4);
      `, 30_000)
      return
    case 'tools-equalizer':
      await cdp.evaluate(`
        const capture = window.__oscineCapture;
        await capture.route('tools');
        capture.store('tools').select('equalizer');
        await capture.nextFrames(4);
        const eq = capture.store('equalizer');
        await capture.unwrap(window.oscine.settings.set({ key: 'audio.eq.enabled', value: true }));
        eq.enabled = true;
        eq.active = {
          enabled: true,
          preampDb: -3.5,
          bands: ${JSON.stringify(EQ_CURVE)}.map((band, index) => ({
            id: 'capture-band-' + index, enabled: true, ...band
          }))
        };
        const name = 'Late night, warm';
        const existing = eq.presets.find((preset) => preset.name === name);
        const id = existing ? (eq.updatePreset(existing.id), existing.id) : eq.savePreset(name);
        // Assign the preset to an album that is not playing, so the list has a
        // row without pulling an override onto the capture lead.
        const page = await capture.unwrap(window.oscine.library.listTracks({
          sort: 'album', direction: 'asc', offset: 0, limit: 500
        }));
        const other = page.tracks.find((track) => track.album === ${JSON.stringify(RIP_ALBUM)});
        if (other?.albumId) await eq.assign({ kind: 'album', id: other.albumId }, id);
        await capture.nextFrames(4);
        capture.click('Spectrum');
        await new Promise((resolve) => setTimeout(resolve, 900));
        await capture.nextFrames(4);
      `, 60_000)
      return
    case 'tools-cdrip':
      await cdp.evaluate(`
        const capture = window.__oscineCapture;
        await capture.route('tools');
        capture.store('tools').select('cd-rip');
        await capture.nextFrames(4);
        // Let the pane's first real poll and destination check land, then stop
        // polling so the staged disc below is not cleared by an empty drive.
        await new Promise((resolve) => setTimeout(resolve, 800));
        const rip = capture.store('cdRip');
        rip.stopPolling();

        const page = await capture.unwrap(window.oscine.library.listTracks({
          sort: 'album', direction: 'asc', offset: 0, limit: 500
        }));
        const disc = page.tracks
          .filter((track) => track.album === ${JSON.stringify(RIP_ALBUM)})
          .sort((a, b) => (a.trackNo ?? 0) - (b.trackNo ?? 0));
        if (disc.length === 0) throw new Error('Rip album not found: ${RIP_ALBUM}');

        let sector = 0;
        const entries = disc.map((track, index) => {
          const sectorCount = Math.round((track.durationSec ?? 30) * 75);
          const entry = { number: index + 1, startSector: sector, sectorCount, isAudio: true, preEmphasis: false };
          sector += sectorCount;
          return entry;
        });
        const hash = JSON.stringify(disc[0]).match(/[0-9a-f]{64}/)?.[0] ?? null;

        rip.drives = [{ id: 'capture-drive', label: 'HL-DT-ST DVDRAM GP65NB60', vendor: 'HL-DT-ST', product: 'DVDRAM GP65NB60' }];
        rip.driveId = 'capture-drive';
        rip.toc = { entries, leadOutSector: sector, firstTrack: 1, lastTrack: entries.length };
        rip.discId = 'Qd7pWm2Rk9sHn4vLx0cT3yJbF8g-';
        const proposal = {
          source: 'musicbrainz',
          albumArtist: disc[0].albumArtist ?? disc[0].artist,
          album: disc[0].album,
          year: disc[0].year,
          country: 'US',
          format: 'CD',
          tracks: disc.map((track, index) => ({ number: index + 1, title: track.title, artist: track.artist }))
        };
        rip.candidates = [proposal];
        rip.selectedCandidate = 0;
        rip.pickerSettled = true;
        rip.album = proposal.album;
        rip.albumArtist = proposal.albumArtist;
        rip.year = proposal.year;
        rip.tracks = proposal.tracks.map((track) => ({ ...track, included: true }));
        if (hash) rip.artwork = { present: true, hash, mime: 'image/jpeg' };
        await new Promise((resolve) => setTimeout(resolve, 500));
        await capture.nextFrames(5);
      `, 60_000)
      return
    default:
      throw new Error(`No recipe for ${key}.`)
  }
}

async function settle(cdp) {
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

function pngDimensions(buffer) {
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') return null
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
}

async function capture(cdp, key) {
  const result = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false
  }, 30_000)
  if (!result.data) throw new Error(`Page.captureScreenshot returned no data for ${key}.`)
  const bytes = Buffer.from(result.data, 'base64')
  const dimensions = pngDimensions(bytes)
  if (dimensions?.width !== 2560 || dimensions?.height !== 1640) {
    throw new Error(
      `${key} was ${dimensions?.width ?? '?'}×${dimensions?.height ?? '?'}; expected 2560×1640.`
    )
  }
  const file = join(outputDir, `${key}.png`)
  await writeFile(file, bytes)
  console.log(`Captured ${key} → ${file} (${(bytes.length / 1024 / 1024).toFixed(1)} MiB)`)
}

async function main() {
  try {
    const response = await fetch(`${endpoint}/json/list`)
    if (response.ok) throw new Error(`A debugger is already using ${endpoint}. Close it or pass --port.`)
  } catch (error) {
    if (error.message.startsWith('A debugger is already')) throw error
  }
  if (!(await exists(join(appDir, 'package.json')))) {
    throw new Error(`No Oscine checkout at ${appDir}. Pass --app-dir DIR.`)
  }

  await mkdir(outputDir, { recursive: true })
  await mkdir(configHome, { recursive: true })
  const manifest = await readManifest()
  const appLog = []
  const remember = (chunk) => {
    appLog.push(...String(chunk).split(/\r?\n/).filter(Boolean))
    if (appLog.length > 80) appLog.splice(0, appLog.length - 80)
  }
  const logTail = () => appLog.slice(-30).join('\n')

  console.log(`Launching Oscine with XDG_CONFIG_HOME=${configHome}`)
  const child = spawn(
    'npm',
    ['run', 'dev', '--', '--', `--remote-debugging-port=${port}`],
    {
      cwd: appDir,
      env: { ...process.env, XDG_CONFIG_HOME: configHome },
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe']
    }
  )
  child.stdout.on('data', remember)
  child.stderr.on('data', remember)

  let cdp = null
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

  try {
    const target = await waitForRenderer(child, logTail)
    cdp = await connect(target.webSocketDebuggerUrl)
    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 820,
      deviceScaleFactor: 2,
      mobile: false,
      screenWidth: 1280,
      screenHeight: 820,
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

    // On an actual empty profile this is captured before any library state is
    // registered. On a rerun the store reopens the same first step, preserving
    // the frame while keeping the command idempotent.
    if (keys[0] === 'onboarding') {
      await prepareShot(cdp, 'onboarding', manifest)
      await settle(cdp)
      await capture(cdp, 'onboarding')
      keys.shift()
    }

    if (keys.length > 0) {
      await cdp.evaluate(`
        const onboarding = window.__oscineCapture.store('onboarding');
        if (onboarding.open) onboarding.close();
      `)
      await ensureLibrary(cdp)
      await ensureCaptureState(cdp)
    }

    for (const key of keys) {
      console.log(`Preparing ${key}…`)
      await prepareShot(cdp, key, manifest)
      const state = await settle(cdp)
      if (state.width !== 1280 || state.height !== 820) {
        throw new Error(`${key} viewport is ${state.width}×${state.height}; expected 1280×820.`)
      }
      await capture(cdp, key)
    }

    console.log(`Done: ${values.all ? SHOT_KEYS.length : 1} master${values.all ? 's' : ''}.`)
  } catch (error) {
    if (logTail()) error.message += `\n\nOscine log tail:\n${logTail()}`
    throw error
  } finally {
    cdp?.close()
    if (values['keep-open']) {
      child.stdout.unref?.()
      child.stderr.unref?.()
      child.unref()
      console.log(`Oscine left running on ${endpoint} (isolated profile: ${configHome}).`)
    } else {
      stop()
    }
  }
}

main().catch((error) => {
  console.error(error.stack ?? error.message)
  process.exitCode = 1
})
