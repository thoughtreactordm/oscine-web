#!/usr/bin/env node
/**
 * record.mjs — record scripted flows from Oscine as smooth, reproducible video.
 *
 *   node tools/capture/record.mjs <flow>|--all [--keep-open]
 *   node tools/capture/record.mjs --list
 *   node tools/capture/record.mjs <flow>|--all --reencode
 *
 * Same isolated profile and fake library as shoot.mjs. Each flow (flows.mjs)
 * is recorded in lockstep: a virtual clock in the renderer (lib/clock.js)
 * holds time still while each 1/fps frame is captured, so the output is
 * evenly paced however long a frame takes to render and screenshot. See
 * README.md for why this beats CDP screencast.
 *
 * Output
 *   <capture-root>/video/<flow>.mkv     lossless FFV1 master, 2560×1640
 *   src/assets/video/<flow>.webm        AV1
 *   src/assets/video/<flow>.mp4         H.264
 *   src/assets/video/<flow>.poster.jpg  poster frame
 *
 * Options
 *   --app-dir DIR       Oscine checkout (default: ../oscine)
 *   --capture-root DIR  capture data root (default: ~/oscine-capture)
 *   --port N            CDP port (default: 9222)
 *   --out DIR           deliverables directory (default: src/assets/video)
 *   --fps N             frame rate (default: 60)
 *   --width N           deliverable width in px (default: 1920; masters stay 2560)
 *   --jpeg              capture JPEG (q95) instead of PNG: ~25% faster, lossy
 *   --audible           don't mute Oscine's audio output while recording
 *   --reencode          skip recording; re-encode existing masters
 *   --keep-open         leave the isolated app running afterwards
 */

import { mkdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { FLOWS } from './flows.mjs'
import { encodeDeliverables, openMaster } from './lib/encode.mjs'
import {
  capturePaths,
  ensureCaptureState,
  ensureLibrary,
  ensurePlaying,
  exists,
  launchOscine,
  repoRoot,
  setBaseState,
  settle,
  VIEWPORT,
  waitUntil
} from './lib/oscine.mjs'
import { Recorder } from './lib/recorder.mjs'

const FLOW_KEYS = Object.keys(FLOWS)

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    all: { type: 'boolean', default: false },
    list: { type: 'boolean', default: false },
    'keep-open': { type: 'boolean', default: false },
    'app-dir': { type: 'string' },
    'capture-root': { type: 'string' },
    port: { type: 'string', default: '9222' },
    out: { type: 'string' },
    fps: { type: 'string', default: '60' },
    width: { type: 'string', default: '1920' },
    jpeg: { type: 'boolean', default: false },
    audible: { type: 'boolean', default: false },
    reencode: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false }
  }
})

function usage() {
  return [
    'Usage: node tools/capture/record.mjs <flow>|--all [--keep-open]',
    '       node tools/capture/record.mjs --list',
    '',
    'Flows:',
    ...FLOW_KEYS.map((key) => `  ${key.padEnd(22)} ${FLOWS[key].description}`),
    '',
    'Options:',
    '  --app-dir DIR       Oscine checkout (default: ../oscine)',
    '  --capture-root DIR  capture data root (default: ~/oscine-capture)',
    '  --port N            CDP port (default: 9222)',
    '  --out DIR           deliverables directory (default: src/assets/video)',
    '  --fps N             frame rate (default: 60)',
    '  --width N           deliverable width (default: 1920; masters stay 2560)',
    '  --jpeg              capture JPEG instead of PNG (faster, lossy)',
    '  --audible           do not mute the app while recording',
    '  --reencode          re-encode existing masters without recording',
    '  --keep-open         leave the isolated app running after capture'
  ].join('\n')
}

if (values.help || values.list) {
  console.log(usage())
  process.exit(0)
}

const requested = values.all ? null : positionals[0]
if ((values.all && positionals.length > 0) || (!values.all && positionals.length !== 1)) {
  console.error(usage())
  process.exit(1)
}
if (requested !== null && !FLOW_KEYS.includes(requested)) {
  console.error(`Unknown flow: ${requested}\n\n${usage()}`)
  process.exit(1)
}

const port = Number(values.port)
const fps = Number(values.fps)
const width = Number(values.width)
for (const [name, value, max] of [['--port', port, 65535], ['--fps', fps, 240], ['--width', width, 2560]]) {
  if (!Number.isInteger(value) || value < 1 || value > max) {
    console.error(`${name} must be an integer from 1 to ${max}.`)
    process.exit(1)
  }
}

const paths = capturePaths({ appDir: values['app-dir'], captureRoot: values['capture-root'] })
const outputDir = resolve(values.out ?? join(repoRoot, 'src', 'assets', 'video'))
const masterDir = join(paths.captureRoot, 'video')
const keys = values.all ? FLOW_KEYS : [requested]
const format = values.jpeg ? 'jpeg' : 'png'

const masterFile = (key) => join(masterDir, `${key}.mkv`)

async function encode(key) {
  const flow = FLOWS[key]
  const started = Date.now()
  await encodeDeliverables(masterFile(key), join(outputDir, key), { width, posterAt: flow.poster ?? 0 })
  const sizes = []
  for (const ext of ['webm', 'mp4', 'poster.jpg']) {
    const { size } = await stat(join(outputDir, `${key}.${ext}`))
    sizes.push(`${ext} ${(size / 1024 / 1024).toFixed(2)} MiB`)
  }
  console.log(`Encoded ${key} in ${((Date.now() - started) / 1000).toFixed(0)} s → ${outputDir} (${sizes.join(', ')})`)
}

async function record(app, key, leadTrackId) {
  const flow = FLOWS[key]
  const { cdp } = app
  console.log(`Preparing ${key}…`)
  await setBaseState(cdp)
  await ensurePlaying(cdp, leadTrackId)
  await cdp.evaluate(`
    const playback = window.__oscineCapture.store('playback');
    playback.seek(${Number(flow.at ?? 12)});
    return true;
  `)
  await flow.setup({ cdp, eval: (body, timeout) => cdp.evaluate(`const capture = window.__oscineCapture; ${body}`, timeout) })
  // A toast raised during setup would otherwise fade out on camera.
  await cdp.evaluate(`
    for (const close of document.querySelectorAll('[role="region"] li[data-state="open"] button[aria-label="Close"]')) {
      close.click();
    }
    return true;
  `)
  await waitUntil(cdp, `!document.querySelector('[role="region"] li[data-state]')`, 'toasts to close', 5_000)
  const state = await settle(cdp)
  if (state.width !== VIEWPORT.width || state.height !== VIEWPORT.height) {
    throw new Error(`${key} viewport is ${state.width}×${state.height}; expected ${VIEWPORT.width}×${VIEWPORT.height}.`)
  }

  const master = openMaster(masterFile(key), { fps, format })
  const expected = { width: VIEWPORT.width * VIEWPORT.deviceScaleFactor, height: VIEWPORT.height * VIEWPORT.deviceScaleFactor }
  const recorder = new Recorder(
    cdp,
    async (buffer, index) => {
      if (index === 0 && format === 'png') {
        const w = buffer.readUInt32BE(16)
        const h = buffer.readUInt32BE(20)
        if (w !== expected.width || h !== expected.height) {
          throw new Error(`${key} frames are ${w}×${h}; expected ${expected.width}×${expected.height}.`)
        }
      }
      await master.write(buffer)
      if (index > 0 && index % fps === 0) process.stdout.write(`  ${index / fps} s\r`)
    },
    { fps, format }
  )

  const started = Date.now()
  let clock = null
  try {
    console.log(`Recording ${key}…`)
    // Seek again with the audio clock frozen: the position (and the seek bar)
    // at frame 0 is then exactly `at` on every run, not `at` plus however long
    // setup took.
    await recorder.start((r) =>
      r.eval(`capture.store('playback').seek(${Number(flow.at ?? 12)}); return true;`)
    )
    await flow.script(recorder)
  } finally {
    clock = await recorder.stop().catch((error) => {
      console.warn(`Could not restore the real clock: ${error.message}`)
      return null
    })
    await master.close()
  }

  const seconds = (Date.now() - started) / 1000
  console.log(
    `Recorded ${key}: ${recorder.frames} frames (${recorder.time.toFixed(2)} s at ${fps} fps) ` +
    `in ${seconds.toFixed(0)} s → ${masterFile(key)}`
  )
  if (clock?.errors?.length) console.warn(`  page errors on the virtual clock:\n    ${clock.errors.join('\n    ')}`)
  if (clock?.audio) {
    const a = clock.audio
    console.log(
      `  audio clock: overshoot mean ${a.overshootMs.mean.toFixed(1)} ms, max ${a.overshootMs.max.toFixed(1)} ms, ` +
      `${a.stalledFrames} stalled frame(s), ${a.reanchors} re-anchor(s)`
    )
  } else {
    console.warn('  audio clock: no playing AudioContext was found; audio ran on the real clock.')
  }
}

async function main() {
  await mkdir(outputDir, { recursive: true })
  await mkdir(masterDir, { recursive: true })

  if (values.reencode) {
    for (const key of keys) {
      if (!(await exists(masterFile(key)))) throw new Error(`No master for ${key} at ${masterFile(key)}. Record it first.`)
      await encode(key)
    }
    return
  }

  const app = await launchOscine({
    paths,
    port,
    electronArgs: values.audible ? [] : ['--mute-audio']
  })
  const { cdp } = app
  try {
    await cdp.evaluate(`
      const capture = window.__oscineCapture;
      const onboarding = capture.store('onboarding');
      if (onboarding.open) onboarding.close();
      await capture.unwrap(window.oscine.settings.set({ key: 'interface.onboardingCompleted', value: true }));
      return true;
    `)
    await ensureLibrary(cdp, paths)
    const seeded = await ensureCaptureState(cdp, paths)
    for (const key of keys) {
      await record(app, key, seeded.captureLeadTrackId)
      await encode(key)
    }
    console.log(`Done: ${keys.length} flow${keys.length === 1 ? '' : 's'}.`)
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
