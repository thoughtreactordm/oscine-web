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
 * The launch, CDP session, renderer helpers and library/state setup live in
 * lib/oscine.mjs, shared with record.mjs; this file owns the shot recipes.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import {
  capturePaths,
  EQ_CURVE,
  ensureCaptureState,
  ensureLibrary,
  launchOscine,
  readManifest,
  repoRoot,
  setBaseState,
  settle
} from './lib/oscine.mjs'

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

const paths = capturePaths({ appDir: values['app-dir'], captureRoot: values['capture-root'] })
const outputDir = resolve(values.out ?? join(repoRoot, 'src', 'assets', 'screenshots'))
// First in an all-run even though it is listed near the end of the public shot
// list: this is the one frame that belongs to the genuinely empty profile.
const keys = values.all
  ? ['onboarding', ...SHOT_KEYS.filter((key) => key !== 'onboarding')]
  : [requested]

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
  await mkdir(outputDir, { recursive: true })
  const manifest = await readManifest(paths)
  const app = await launchOscine({ paths, port })
  const { cdp } = app

  try {
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
      await ensureLibrary(cdp, paths)
      await ensureCaptureState(cdp, paths)
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
    if (app.logTail()) error.message += `\n\nOscine log tail:\n${app.logTail()}`
    throw error
  } finally {
    cdp.close()
    if (values['keep-open']) {
      app.detach()
      console.log(`Oscine left running on ${app.endpoint} (isolated profile: ${paths.configHome}).`)
    } else {
      app.stop()
    }
  }
}

main().catch((error) => {
  console.error(error.stack ?? error.message)
  process.exitCode = 1
})
