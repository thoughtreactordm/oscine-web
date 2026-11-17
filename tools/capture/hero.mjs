#!/usr/bin/env node
/**
 * hero.mjs — join recorded flows and still splashes into the home page's
 * looping hero video.
 *
 *   node tools/capture/hero.mjs [--width N]
 *
 * HERO.sequence mixes two kinds of entry:
 *
 *   { flow: 'library-flythrough' }        a lossless master record.mjs left in
 *                                         <capture-root>/video/
 *   { still: 'theme-nocturne', seconds }  a 2× screenshot master from
 *                                         src/assets/screenshots/, held still
 *
 * Entries are joined with crossfades: HERO.fade between two flows, the
 * shorter HERO.splashFade into and out of a still, so the stills land as
 * quick splashes between the motion. The loop point gets a crossfade too: the
 * last entry fades into the opening of the first, and the output starts that
 * far into the first, so the browser's jump from the end back to the start is
 * seamless. The result is a hero.mkv master next to the flow masters, and the
 * shipped files come out of encodeDeliverables like every other flow:
 *
 *   src/assets/video/hero.webm, hero.mp4, hero.poster.jpg
 *
 * Re-record a flow with record.mjs (or re-shoot a still with shoot.mjs), then
 * re-run this to rebuild the hero.
 *
 * Options
 *   --capture-root DIR  capture data root (default: ~/oscine-capture)
 *   --out DIR           deliverables directory (default: src/assets/video)
 *   --width N           deliverable width in px (default: 1920)
 */

import { spawn } from 'node:child_process'
import { mkdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { encodeDeliverables } from './lib/encode.mjs'
import { capturePaths, exists, repoRoot, VIEWPORT } from './lib/oscine.mjs'

/**
 * Speed first (the library, search as you type), then a splash of places to
 * explore, the Stage, a splash of looks (light, Nocturne, the theme editor),
 * and the EQ.
 */
const HERO = Object.freeze({
  sequence: [
    { flow: 'library-flythrough' },
    { still: 'tunedeck-track', seconds: 0.8 },
    { still: 'curate-discover', seconds: 0.8 },
    { still: 'stats', seconds: 0.8 },
    { flow: 'stage-visualizer' },
    { still: 'theme-oscine-light', seconds: 0.7 },
    { still: 'theme-nocturne', seconds: 0.7 },
    { still: 'theme-editor', seconds: 0.9 },
    { flow: 'eq-drag' }
  ],
  fade: 0.4,
  splashFade: 0.15,
  fps: 60
})

const { values } = parseArgs({
  options: {
    'capture-root': { type: 'string' },
    out: { type: 'string' },
    width: { type: 'string', default: '1920' },
    help: { type: 'boolean', short: 'h', default: false }
  }
})

if (values.help) {
  console.log('Usage: node tools/capture/hero.mjs [--width N] [--capture-root DIR] [--out DIR]')
  process.exit(0)
}

const width = Number(values.width)
if (!Number.isInteger(width) || width < 1 || width > 2560) {
  console.error('--width must be an integer from 1 to 2560.')
  process.exit(1)
}

const paths = capturePaths({ captureRoot: values['capture-root'] })
const masterDir = join(paths.captureRoot, 'video')
const stillDir = join(repoRoot, 'src', 'assets', 'screenshots')
const outputDir = resolve(values.out ?? join(repoRoot, 'src', 'assets', 'video'))
const heroMaster = join(masterDir, 'hero.mkv')
const frame = {
  width: VIEWPORT.width * VIEWPORT.deviceScaleFactor,
  height: VIEWPORT.height * VIEWPORT.deviceScaleFactor
}

function run(command, args) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => (stdout += chunk))
    child.stderr.on('data', (chunk) => (stderr = (stderr + chunk).slice(-4000)))
    child.on('error', reject)
    child.on('close', (code) =>
      code === 0 ? resolveRun(stdout) : reject(new Error(`${command} exited ${code}: ${stderr.trim()}`))
    )
  })
}

async function duration(file) {
  const out = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file])
  const seconds = Number(out.trim())
  if (!Number.isFinite(seconds) || seconds <= 0) throw new Error(`Could not read the duration of ${file}.`)
  return seconds
}

/** Resolve each entry to its file, ffmpeg input args, length and a label. */
async function resolveEntries() {
  const entries = []
  for (const entry of HERO.sequence) {
    if (entry.flow) {
      const file = join(masterDir, `${entry.flow}.mkv`)
      if (!(await exists(file))) throw new Error(`No master for ${entry.flow} at ${file}. Record it with record.mjs first.`)
      entries.push({ label: entry.flow, still: false, file, input: ['-i', file], seconds: await duration(file) })
    } else {
      const file = join(stillDir, `${entry.still}.png`)
      if (!(await exists(file))) throw new Error(`No screenshot ${entry.still} at ${file}. Shoot it with shoot.mjs first.`)
      const seconds = entry.seconds
      entries.push({
        label: entry.still,
        still: true,
        file,
        input: ['-loop', '1', '-framerate', String(HERO.fps), '-t', String(seconds), '-i', file],
        seconds
      })
    }
  }
  if (entries[0].still) throw new Error('HERO.sequence must start with a flow: the loop fades into its opening.')
  return entries
}

/** The crossfade between two neighbours: short when either is a still. */
const fadeBetween = (a, b) => (a.still || b.still ? HERO.splashFade : HERO.fade)

/**
 * The filter graph: normalize every input to the masters' size, rate and
 * timebase, chain xfades, fade the tail into a copy of the first entry's
 * opening, then trim that opening off the front.
 */
function filterGraph(entries) {
  const { fps } = HERO
  const parts = entries.map(
    (entry, i) =>
      `[${i}:v]scale=${frame.width}:${frame.height}:flags=lanczos,format=gbrp,fps=${fps},settb=AVTB,setpts=PTS-STARTPTS[v${i}]`
  )
  const loopFade = fadeBetween(entries.at(-1), entries[0])
  parts.push(`[v0]split[v0a][v0b]`, `[v0b]trim=0:${loopFade},setpts=PTS-STARTPTS[head]`)

  let current = 'v0a'
  let length = entries[0].seconds
  for (let i = 1; i < entries.length; i += 1) {
    const fade = fadeBetween(entries[i - 1], entries[i])
    parts.push(`[${current}][v${i}]xfade=transition=fade:duration=${fade}:offset=${(length - fade).toFixed(4)}[x${i}]`)
    current = `x${i}`
    length += entries[i].seconds - fade
  }
  parts.push(`[${current}][head]xfade=transition=fade:duration=${loopFade}:offset=${(length - loopFade).toFixed(4)}[looped]`)
  parts.push(`[looped]trim=start=${loopFade},setpts=PTS-STARTPTS,format=bgr0[out]`)
  return { graph: parts.join(';'), seconds: length - loopFade }
}

async function main() {
  const entries = await resolveEntries()
  const { graph, seconds } = filterGraph(entries)
  console.log(`Joining ${entries.map((entry) => entry.label).join(' → ')} (${seconds.toFixed(2)} s)`)

  const started = Date.now()
  await run('ffmpeg', [
    '-hide_banner', '-v', 'error', '-y',
    ...entries.flatMap((entry) => entry.input),
    '-filter_complex', graph,
    '-map', '[out]',
    '-c:v', 'ffv1', '-level', '3', '-g', '1', '-slices', '16', '-slicecrc', '1',
    heroMaster
  ])

  await mkdir(outputDir, { recursive: true })
  await encodeDeliverables(heroMaster, join(outputDir, 'hero'), { width, posterAt: 0 })

  const sizes = []
  for (const ext of ['webm', 'mp4', 'poster.jpg']) {
    const { size } = await stat(join(outputDir, `hero.${ext}`))
    sizes.push(`${ext} ${(size / 1024 / 1024).toFixed(2)} MiB`)
  }
  console.log(`Encoded hero in ${((Date.now() - started) / 1000).toFixed(0)} s → ${outputDir} (${sizes.join(', ')})`)
}

main().catch((error) => {
  console.error(error.message ?? error)
  process.exit(1)
})
