#!/usr/bin/env node
/**
 * hero.mjs — join recorded flows into the home page's looping hero video.
 *
 *   node tools/capture/hero.mjs [--width N]
 *
 * Reads the lossless masters record.mjs left in <capture-root>/video/, joins
 * HERO.clips in order with short crossfades, and writes a hero.mkv master
 * next to them. The loop point gets a crossfade too: the last clip fades into
 * the opening of the first, and the output starts that far into the first
 * clip, so the browser's jump from the end back to the start is seamless.
 * The shipped files then come out of encodeDeliverables like every other
 * flow:
 *
 *   src/assets/video/hero.webm, hero.mp4, hero.poster.jpg
 *
 * Re-record a flow with record.mjs, then re-run this to rebuild the hero.
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
import { capturePaths, exists, repoRoot } from './lib/oscine.mjs'

/** Storyboard order: speed first (library, search), then range (Stage, EQ). */
const HERO = Object.freeze({
  clips: ['library-flythrough', 'stage-visualizer', 'eq-drag'],
  fade: 0.4,
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
const outputDir = resolve(values.out ?? join(repoRoot, 'src', 'assets', 'video'))
const heroMaster = join(masterDir, 'hero.mkv')

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

/**
 * The filter graph: normalize every input, chain xfades, fade the tail into a
 * copy of the first clip's opening, then trim that opening off the front.
 */
function filterGraph(durations) {
  const { fade, fps } = HERO
  const parts = durations.map((_, i) => `[${i}:v]format=gbrp,fps=${fps},settb=AVTB,setpts=PTS-STARTPTS[v${i}]`)
  parts.push(`[v0]split[v0a][v0b]`, `[v0b]trim=0:${fade},setpts=PTS-STARTPTS[head]`)

  let current = 'v0a'
  let length = durations[0]
  for (let i = 1; i < durations.length; i += 1) {
    const offset = (length - fade).toFixed(4)
    parts.push(`[${current}][v${i}]xfade=transition=fade:duration=${fade}:offset=${offset}[x${i}]`)
    current = `x${i}`
    length += durations[i] - fade
  }
  parts.push(`[${current}][head]xfade=transition=fade:duration=${fade}:offset=${(length - fade).toFixed(4)}[looped]`)
  parts.push(`[looped]trim=start=${fade},setpts=PTS-STARTPTS,format=bgr0[out]`)
  return { graph: parts.join(';'), seconds: length - fade }
}

async function main() {
  const masters = HERO.clips.map((key) => join(masterDir, `${key}.mkv`))
  for (const [index, file] of masters.entries()) {
    if (!(await exists(file))) {
      throw new Error(`No master for ${HERO.clips[index]} at ${file}. Record it with record.mjs first.`)
    }
  }

  const durations = await Promise.all(masters.map(duration))
  const { graph, seconds } = filterGraph(durations)
  console.log(`Joining ${HERO.clips.join(' → ')} (${seconds.toFixed(2)} s)`)

  const started = Date.now()
  await run('ffmpeg', [
    '-hide_banner', '-v', 'error', '-y',
    ...masters.flatMap((file) => ['-i', file]),
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
