#!/usr/bin/env node
/**
 * crops.mjs — cut every derived image the pages need from the 2× masters.
 *
 *   node tools/capture/crops.mjs [--force]
 *
 * Never re-captures. Coordinates are pixels on the 2560×1640 masters
 * (1280×820 at deviceScaleFactor 2). A re-shoot of the masters followed by
 * this script regenerates the same keys. Running twice is a no-op: identical
 * bytes are left untouched so mtimes stay put.
 *
 * Optional overrides:
 *
 *   --masters DIR   screenshot directory (default: src/assets/screenshots)
 *   --out DIR       crop directory (default: src/assets/screenshots/crops)
 *   --force         rewrite even when the bytes match
 *
 * Crop table is { key, source, x, y, w, h }. Optional `width`/`height` resize
 * after the extract (OG). `themes-trio` is the same extract from three
 * masters, scaled and stitched side by side.
 *
 * Pages consume these through astro:assets (AVIF/WebP at 1280 and 1920).
 */

import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..')

/**
 * Pixel crops on the 2× masters. Layout at 2×:
 *   title bar 0–72, tab row 72–144, transport 1480–1640,
 *   sidebar ~0–640, list body from x=656.
 *
 * Modals: UModal max-w-4xl (theme tokens) and max-w-3xl (track info),
 * centered, padded 8px so the rounded frame is inside the crop.
 * Column chooser: the popover is not in any master (never re-capture);
 * this is the Songs toolbar + column headers, including the columns-3 button.
 */
const CROPS = Object.freeze([
  {
    key: 'pillar-columns',
    source: 'library-hero',
    x: 656,
    y: 144,
    w: 1888,
    h: 736,
    usedBy: 'Home Control pillar — track-list columns'
  },
  {
    key: 'pillar-stage',
    source: 'stage',
    x: 720,
    y: 180,
    w: 1200,
    h: 1180,
    usedBy: 'Home Design pillar — the Stage'
  },
  {
    key: 'pillar-theme-picker',
    source: 'theme-editor',
    x: 375,
    y: 238,
    w: 1808,
    h: 1164,
    usedBy: 'Home Yours pillar — token editor (theme picker lives in settings behind this)'
  },
  {
    key: 'column-chooser',
    source: 'library-hero',
    x: 656,
    y: 144,
    w: 1888,
    h: 112,
    usedBy: 'Features Library — column chooser control + headers'
  },
  {
    key: 'track-info',
    source: 'track-info',
    x: 504,
    y: 194,
    w: 1552,
    h: 1254,
    usedBy: 'Features Playback — track info modal'
  },
  {
    key: 'og',
    source: 'library-hero',
    x: 0,
    y: 0,
    w: 2560,
    h: 1344,
    width: 1200,
    height: 630,
    usedBy: 'Open Graph — library-hero at 1200×630, not the mark'
  }
])

const TRIO = Object.freeze({
  key: 'themes-trio',
  sources: ['theme-oscine-dark', 'theme-oscine-light', 'theme-nocturne'],
  x: 0,
  y: 0,
  w: 2560,
  h: 1640,
  panelWidth: 960,
  gap: 20,
  background: '#111111',
  usedBy: 'Features Themes — Oscine dark / light / Nocturne side by side'
})

const { values } = parseArgs({
  options: {
    masters: { type: 'string' },
    out: { type: 'string' },
    force: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false }
  }
})

function usage() {
  return [
    'Usage: node tools/capture/crops.mjs [--force]',
    '',
    'Cut derived images from the 2× masters. Never re-captures.',
    '',
    'Options:',
    '  --masters DIR   screenshot directory (default: src/assets/screenshots)',
    '  --out DIR       crop directory (default: src/assets/screenshots/crops)',
    '  --force         rewrite even when the bytes already match'
  ].join('\n')
}

if (values.help) {
  console.log(usage())
  process.exit(0)
}

const mastersDir = resolve(values.masters ?? join(repoRoot, 'src', 'assets', 'screenshots'))
const outDir = resolve(values.out ?? join(repoRoot, 'src', 'assets', 'screenshots', 'crops'))

async function masterPath(source) {
  const file = join(mastersDir, `${source}.png`)
  try {
    await access(file)
  } catch {
    throw new Error(`Missing master ${file}. Run shoot.mjs before crops.mjs.`)
  }
  return file
}

async function writeIfChanged(dest, bytes) {
  if (!values.force) {
    try {
      const existing = await readFile(dest)
      if (existing.equals(bytes)) return 'unchanged'
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  await writeFile(dest, bytes)
  return 'wrote'
}

async function extractCrop(entry) {
  const input = await masterPath(entry.source)
  let pipeline = sharp(input).extract({
    left: entry.x,
    top: entry.y,
    width: entry.w,
    height: entry.h
  })
  if (entry.width && entry.height) {
    pipeline = pipeline.resize(entry.width, entry.height, { fit: 'fill' })
  }
  return pipeline.png().toBuffer()
}

async function extractTrio() {
  const panelHeight = Math.round((TRIO.h * TRIO.panelWidth) / TRIO.w)
  const panels = await Promise.all(
    TRIO.sources.map(async (source) => {
      const input = await masterPath(source)
      return sharp(input)
        .extract({ left: TRIO.x, top: TRIO.y, width: TRIO.w, height: TRIO.h })
        .resize(TRIO.panelWidth, panelHeight)
        .png()
        .toBuffer()
    })
  )
  const width = TRIO.panelWidth * panels.length + TRIO.gap * (panels.length - 1)
  return sharp({
    create: {
      width,
      height: panelHeight,
      channels: 3,
      background: TRIO.background
    }
  })
    .composite(
      panels.map((input, index) => ({
        input,
        left: index * (TRIO.panelWidth + TRIO.gap),
        top: 0
      }))
    )
    .png()
    .toBuffer()
}

async function main() {
  await mkdir(outDir, { recursive: true })
  const jobs = [
    ...CROPS.map((entry) => ({ key: entry.key, run: () => extractCrop(entry) })),
    { key: TRIO.key, run: extractTrio }
  ]
  let wrote = 0
  let unchanged = 0
  for (const job of jobs) {
    const dest = join(outDir, `${job.key}.png`)
    const bytes = await job.run()
    const result = await writeIfChanged(dest, bytes)
    if (result === 'wrote') wrote += 1
    else unchanged += 1
    const info = await sharp(bytes).metadata()
    console.log(`${result.padEnd(9)} ${job.key}.png  ${info.width}×${info.height}`)
  }
  console.log(`${wrote} wrote, ${unchanged} unchanged → ${outDir}`)
}

main().catch((error) => {
  console.error(error.message ?? error)
  process.exit(1)
})
