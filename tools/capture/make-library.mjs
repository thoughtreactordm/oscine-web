#!/usr/bin/env node
/*
 * make-library.mjs — generate the fictional, playable capture library.
 *
 * Reads tools/capture/library.json and writes real audio files with real tags
 * to ~/oscine-capture (override with --out). See docs/1.0-site-release.md §5.1.
 *
 *   node tools/capture/make-library.mjs [--out DIR] [--only "Artist"] [--force]
 *                                      [--jobs N] [--port 8765] [--dry-run]
 *
 * Output:
 *   DIR/library/Artist/Album/NN Title.ext   (flac | mp3 | opus | ogg)
 *   DIR/library/Artist/Album/cover.jpg
 *   DIR/podcasts/<slug>/{feed.xml,cover.jpg,NN-slug.mp3}  → serve with serve.mjs
 *   DIR/manifest.json                        (what was generated; used by shoot.mjs)
 *
 * Covers: every album and podcast gets a 1000×1000 crop from
 * covers/sources.json (photographic Unsplash). A generated gradient is only
 * the last-resort fallback if a download fails. Oscine prefers embedded art,
 * so a cover refresh re-embeds into existing FLAC/MP3 without re-encoding audio.
 *
 * Requires ffmpeg (flac, libmp3lame, libopus, libvorbis) and metaflac. Existing
 * audio files are skipped unless --force, so re-runs are cheap.
 */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { cpus, homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const opt = (name, def) => { const i = args.indexOf(name); return i === -1 ? def : args[i + 1] }
const flag = (name) => args.includes(name)

const OUT = resolve(opt('--out', join(homedir(), 'oscine-capture')))
const ONLY = opt('--only', null)
const FORCE = flag('--force')
const DRY = flag('--dry-run')
const PORT = Number(opt('--port', 8765))
const JOBS = Number(opt('--jobs', Math.max(1, cpus().length - 1)))
const HOST = `http://127.0.0.1:${PORT}`
const FEED_ANCHOR = Date.UTC(2026, 7, 1) // episodes dated weekly back from 1 Aug 2026

const lib = JSON.parse(await readFile(join(here, 'library.json'), 'utf8'))
const sourceCatalog = JSON.parse(await readFile(join(here, 'covers/sources.json'), 'utf8'))
const sourceDir = join(here, 'covers', 'sources')
const usedPhotos = new Set()

// ---------------------------------------------------------------- helpers

function run(cmd, argv) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, argv, { stdio: ['ignore', 'pipe', 'pipe'] })
    let err = ''
    p.stderr.on('data', (d) => { err += d })
    p.on('error', rej)
    p.on('close', (code) => code === 0 ? res() : rej(new Error(`${cmd} ${argv.slice(0, 3).join(' ')}… exited ${code}\n${err.slice(-800)}`)))
  })
}

async function exists(p) { try { await access(p); return true } catch { return false } }

async function pmap(items, n, fn) {
  const out = new Array(items.length)
  let i = 0
  const worker = async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k) } }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker))
  return out
}

const hashBytes = (s) => createHash('sha1').update(s).digest()
const safe = (s) => s.replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, ' ').replace(/[. ]+$/, '').trim()
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const pad2 = (n) => String(n).padStart(2, '0')

function hsl(h, s, l) {
  const a = s * Math.min(l, 1 - l)
  const f = (n) => { const k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)) }
  return '0x' + [f(0), f(8), f(4)].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')
}

// ------------------------------------------------------------- audio recipe

const ROOTS = [110, 123.47, 130.81, 146.83, 164.81, 174.61, 196, 220]
const RATIOS = [1.5, 1.25, 1.2, 1.333, 1.6, 1.125]
const NOISES = ['pink', 'brown', 'white']

function recipe(key, { minDur = 20, spread = 21 } = {}) {
  const h = hashBytes(key)
  const f = ROOTS[h[1] % ROOTS.length] * (1 + (h[2] % 3))
  return {
    dur: minDur + (h[0] % spread),
    f,
    ratio: RATIOS[h[3] % RATIOS.length],
    lfo: 0.1 + (h[4] % 40) / 100,
    noise: NOISES[h[5] % NOISES.length],
    noiseAmp: 0.02 + (h[6] % 6) / 100,
    seed: h.readUInt32BE(7)
  }
}

function toneInputs(r, rate) {
  const { f, ratio, lfo, dur } = r
  // Two channel expressions: the right channel detunes the upper partials and
  // offsets the LFOs so the stereo image moves a little. Real stereo, not a dupe.
  const voice = (det, ph) => [
    `0.35*sin(2*PI*${f}*t)`,
    `0.2*sin(2*PI*${(f * ratio * det).toFixed(3)}*t)*(0.5+0.5*sin(2*PI*${lfo}*t+${ph}))`,
    `0.12*sin(2*PI*${(f * 2 * det).toFixed(3)}*t)*(0.5+0.5*cos(2*PI*${(lfo * 0.7).toFixed(3)}*t+${ph}))`,
    `0.08*sin(2*PI*${(f * ratio * 2).toFixed(3)}*t)*(0.5+0.5*sin(2*PI*${(lfo * 1.3).toFixed(3)}*t+1+${ph}))`
  ].join('+')
  return [
    '-f', 'lavfi', '-i', `aevalsrc=${voice(1, 0)}|${voice(1.003, 0.9)}:s=${rate}:c=stereo:d=${dur}`,
    '-f', 'lavfi', '-i', `anoisesrc=color=${r.noise}:amplitude=${r.noiseAmp}:seed=${r.seed}:r=${rate}:d=${dur}`
  ]
}

function mixFilter(r, extra = '') {
  return `[1:a]aformat=channel_layouts=stereo[n];[0:a][n]amix=inputs=2:normalize=0${extra},afade=t=in:d=1.5,afade=t=out:st=${r.dur - 2.5}:d=2.5,volume=0.9[a]`
}

// ------------------------------------------------------------------ covers

function pickPhoto(key, used) {
  const photos = sourceCatalog.photos
  if (!photos?.length) return null
  const h = hashBytes('source/' + key)
  const start = h.readUInt16BE(0) % photos.length
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[(start + i) % photos.length]
    if (!used.has(photo.id)) {
      used.add(photo.id)
      return photo
    }
  }
  return photos[start]
}

async function downloadTo(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'oscine-web-capture/1.0' }, redirect: 'follow' })
  if (!res.ok) throw new Error(`GET ${url} → HTTP ${res.status}`)
  await writeFile(dest, Buffer.from(await res.arrayBuffer()))
}

async function ensureSource(photo) {
  await mkdir(sourceDir, { recursive: true })
  const dest = join(sourceDir, `${photo.id}.jpg`)
  if (await exists(dest)) return dest
  await downloadTo(`https://unsplash.com/photos/${photo.id}/download?force=true&w=1400`, dest)
  return dest
}

async function gradientCover(dest, key, label) {
  const h = hashBytes('cover/' + key)
  const hue = h[0] * 360 / 255
  const type = ['linear', 'radial', 'circular', 'spiral'][h[1] % 4]
  const c0 = hsl(hue, 0.55 + (h[2] % 30) / 100, 0.18 + (h[3] % 15) / 100)
  const c1 = hsl((hue + 30 + h[4] % 60) % 360, 0.6, 0.45 + (h[5] % 20) / 100)
  const c2 = hsl((hue + 180 + h[6] % 40) % 360, 0.5, 0.3 + (h[7] % 25) / 100)
  const pt = (b) => (b % 201) * 4
  const src = `gradients=s=1000x1000:c0=${c0}:c1=${c1}:c2=${c2}:nb_colors=3:type=${type}:seed=${h.readUInt16BE(8)}:x0=${pt(h[10])}:y0=${pt(h[11])}:x1=${1000 - pt(h[12])}:y1=${1000 - pt(h[13])}`
  const grain = 12 + (h[14] % 18)
  if (DRY) return `would generate (${label})`
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', src,
    '-vf', `noise=alls=${grain}:allf=u,vignette=PI/${4 + h[15] % 3},format=yuvj420p`,
    '-frames:v', '1', '-q:v', '3', dest])
  return 'generated'
}

async function deriveCover(dest, sourcePath, key) {
  const h = hashBytes('cover/' + key)
  const contrast = (1.04 + (h[0] % 8) / 100).toFixed(2)
  const sat = (1.04 + (h[1] % 12) / 100).toFixed(2)
  const vf = `scale=1000:1000:force_original_aspect_ratio=increase,crop=1000:1000,eq=contrast=${contrast}:saturation=${sat},vignette=PI/6,format=yuvj420p`
  if (DRY) return 'would derive'
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', sourcePath,
    '-vf', vf, '-frames:v', '1', '-q:v', '3', dest])
  return 'derived'
}

async function makeCover(dest, key, label, photo) {
  if (photo) {
    if (DRY) return 'would derive'
    try {
      const sourcePath = await ensureSource(photo)
      return await deriveCover(dest, sourcePath, key)
    } catch (error) {
      console.warn(`cover source ${photo.id} failed (${error.message}); falling back to a generated abstract`)
    }
  }
  if (!FORCE && await exists(dest)) return 'kept'
  return gradientCover(dest, key, label)
}

async function reembedCover(file, coverPath, fmt) {
  if (fmt === 'flac') {
    try { await run('metaflac', ['--remove', '--block-type=PICTURE', file]) } catch { /* no existing picture */ }
    await run('metaflac', [`--import-picture-from=3||Album cover||${coverPath}`, file])
    return
  }
  if (fmt === 'mp3') {
    const tmp = `${file}.new.mp3`
    await run('ffmpeg', [
      '-y', '-loglevel', 'error', '-i', file, '-i', coverPath,
      '-map', '0:a', '-map', '1:v', '-c', 'copy', '-map_metadata', '0',
      '-id3v2_version', '3', '-disposition:v', 'attached_pic',
      '-metadata:s:v', 'title=Album cover', '-metadata:s:v', 'comment=Cover (front)',
      tmp
    ])
    await rename(tmp, file)
  }
}

// ------------------------------------------------------------------ tracks

function tracksOf(album) {
  const discs = album.discs ? album.discs : [album.tracks]
  const out = []
  discs.forEach((list, di) => list.forEach((t, ti) => {
    const track = typeof t === 'string' ? { title: t } : t
    out.push({ ...track, disc: di + 1, discs: discs.length, n: ti + 1, of: list.length })
  }))
  return out
}

async function encodeTrack({ artist, album, track, dir, coverPath, coverRefreshed }) {
  const fmt = album.format || 'flac'
  const hires = !!album.hires
  const rate = hires ? 48000 : 44100
  const ext = { flac: 'flac', mp3: 'mp3', opus: 'opus', ogg: 'ogg' }[fmt]
  const prefix = track.discs > 1 ? `${track.disc}-${pad2(track.n)}` : pad2(track.n)
  const file = join(dir, `${prefix} ${safe(track.title)}.${ext}`)
  if (!FORCE && await exists(file)) {
    if (coverRefreshed && !DRY && (fmt === 'flac' || fmt === 'mp3')) {
      await reembedCover(file, coverPath, fmt)
      return { file, status: 're-covered' }
    }
    return { file, status: 'kept' }
  }
  if (DRY) return { file, status: 'would encode' }

  const r = recipe(`${artist.name}/${album.title}/${track.disc}/${track.title}`)
  // One designated capture lead is long enough for the agreed ~1:10 player
  // state. Every ordinary library track keeps the 20–40 s fast-listen fixture.
  if (Number.isFinite(track.duration) && track.duration > 0) r.dur = track.duration
  const meta = [
    ['title', track.title],
    ['artist', track.artist || artist.name],
    ['album_artist', artist.name],
    ['album', album.title],
    ['genre', album.genre || artist.genre],
    ['date', String(album.year)],
    ['track', fmt === 'mp3' ? `${track.n}/${track.of}` : String(track.n)],
    ['disc', fmt === 'mp3' ? `${track.disc}/${track.discs}` : String(track.disc)]
  ]
  if (fmt !== 'mp3') meta.push(['TRACKTOTAL', String(track.of)], ['DISCTOTAL', String(track.discs)])
  if (album.compilation) meta.push(['compilation', '1'])

  const argv = ['-y', '-loglevel', 'error', ...toneInputs(r, rate)]
  const codec = {
    flac: ['-c:a', 'flac', '-compression_level', '5', '-sample_fmt', hires ? 's32' : 's16', '-ar', String(rate)],
    mp3: ['-c:a', 'libmp3lame', '-b:a', '320k', '-ar', String(rate), '-id3v2_version', '3'],
    opus: ['-c:a', 'libopus', '-b:a', '160k'],
    ogg: ['-c:a', 'libvorbis', '-q:a', '7', '-ar', String(rate)]
  }[fmt]

  if (fmt === 'mp3') {
    // embed the cover as an attached picture (ID3 APIC)
    argv.push('-i', coverPath, '-filter_complex', mixFilter(r), '-map', '[a]', '-map', '2:v', '-c:v', 'copy',
      '-disposition:v', 'attached_pic', '-metadata:s:v', 'title=Album cover', '-metadata:s:v', 'comment=Cover (front)')
  } else {
    argv.push('-filter_complex', mixFilter(r), '-map', '[a]')
  }
  argv.push(...codec)
  for (const [k, v] of meta) argv.push('-metadata', `${k}=${v}`)
  argv.push(file)
  await run('ffmpeg', argv)
  if (fmt === 'flac') await run('metaflac', [`--import-picture-from=3||Album cover||${coverPath}`, file])
  return { file, status: 'encoded' }
}

// ---------------------------------------------------------------- podcasts

function rfc822(ms) { return new Date(ms).toUTCString() }
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

async function makePodcast(show) {
  const dir = join(OUT, 'podcasts', show.slug)
  await mkdir(dir, { recursive: true })
  const cover = join(dir, 'cover.jpg')
  const coverStatus = await makeCover(cover, `podcast/${show.slug}`, show.title, pickPhoto(`podcast/${show.slug}`, usedPhotos))
  const items = []
  for (const [i, ep] of show.episodes.entries()) {
    const file = join(dir, `${pad2(i + 1)}-${slug(ep.title)}.mp3`)
    const dur = Math.round(ep.minutes * 60)
    let status = 'kept'
    if (FORCE || !(await exists(file))) {
      status = DRY ? 'would encode' : 'encoded'
      if (!DRY) {
        const r = recipe(`${show.slug}/${ep.title}`)
        // speech-ish: band-limited brown noise pulsed at syllable rate, plus a faint room tone
        const seed = r.seed
        await run('ffmpeg', ['-y', '-loglevel', 'error',
          '-f', 'lavfi', '-i', `anoisesrc=color=brown:amplitude=0.9:seed=${seed}:r=44100:d=${dur}`,
          '-f', 'lavfi', '-i', `aevalsrc=0.02*sin(2*PI*60*t)+0.015*sin(2*PI*${r.f}*t):s=44100:d=${dur}`,
          '-filter_complex',
          `[0:a]bandpass=f=420:width_type=o:w=2.2,tremolo=f=${(3 + (seed % 20) / 10).toFixed(1)}:d=0.85,tremolo=f=0.23:d=0.6,volume=2.5[v];` +
          `[v][1:a]amix=inputs=2:normalize=0,afade=t=in:d=0.5,afade=t=out:st=${dur - 1.5}:d=1.5,aformat=channel_layouts=mono[a]`,
          '-map', '[a]', '-c:a', 'libmp3lame', '-b:a', '96k', '-id3v2_version', '3',
          '-metadata', `title=${ep.title}`, '-metadata', `artist=${show.author}`, '-metadata', `album=${show.title}`,
          '-metadata', 'genre=Podcast', '-metadata', `track=${i + 1}`, file])
      }
    }
    const size = DRY ? 0 : (await stat(file)).size
    const pub = FEED_ANCHOR - (show.episodes.length - 1 - i) * 7 * 86400e3
    const url = `${HOST}/${show.slug}/${file.split('/').pop()}`
    items.push({ ep, file, status, size, pub, url, dur, n: i + 1 })
  }
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(show.title)}</title>
    <link>${HOST}/${show.slug}/</link>
    <atom:link href="${HOST}/${show.slug}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <description>${esc(show.description)}</description>
    <itunes:author>${esc(show.author)}</itunes:author>
    <itunes:summary>${esc(show.description)}</itunes:summary>
    <itunes:image href="${HOST}/${show.slug}/cover.jpg"/>
    <image><url>${HOST}/${show.slug}/cover.jpg</url><title>${esc(show.title)}</title><link>${HOST}/${show.slug}/</link></image>
    <itunes:explicit>false</itunes:explicit>
    <itunes:category text="Music"/>
${items.slice().reverse().map((it) => `    <item>
      <title>${esc(it.ep.title)}</title>
      <description>${esc(it.ep.description)}</description>
      <itunes:summary>${esc(it.ep.description)}</itunes:summary>
      <itunes:episode>${it.n}</itunes:episode>
      <itunes:duration>${it.dur}</itunes:duration>
      <guid isPermaLink="false">${show.slug}-${pad2(it.n)}</guid>
      <pubDate>${rfc822(it.pub)}</pubDate>
      <enclosure url="${it.url}" length="${it.size}" type="audio/mpeg"/>
    </item>`).join('\n')}
  </channel>
</rss>
`
  if (!DRY) await writeFile(join(dir, 'feed.xml'), feed)
  return { show: show.title, feed: `${HOST}/${show.slug}/feed.xml`, cover: coverStatus, episodes: items.map((i) => i.status) }
}

// -------------------------------------------------------------------- main

const artists = lib.artists.filter((a) => !ONLY || a.name.toLowerCase().includes(ONLY.toLowerCase()))
if (!artists.length) { console.error(`--only "${ONLY}" matched no artist`); process.exit(1) }

console.log(`${DRY ? '[dry-run] ' : ''}→ ${OUT}  (${artists.length} artists, ${JOBS} jobs)`)
await mkdir(join(OUT, 'library'), { recursive: true })

const jobs = []
const albums = []
for (const artist of artists) {
  for (const album of artist.albums) {
    const dir = join(OUT, 'library', safe(artist.name), safe(album.title))
    const coverPath = join(dir, 'cover.jpg')
    albums.push({ artist, album, dir, coverPath })
    for (const track of tracksOf(album)) jobs.push({ artist, album, track, dir, coverPath })
  }
}

// covers first (tracks embed them), then tracks in parallel
const failures = []
const coverStats = { kept: 0, copied: 0, derived: 0, generated: 0 }
const refreshedCovers = new Set()
for (const { artist, album, dir, coverPath } of albums) {
  await mkdir(dir, { recursive: true })
  try {
    const s = await makeCover(coverPath, `${artist.name}/${album.title}`, album.title, pickPhoto(`${artist.name}/${album.title}`, usedPhotos))
    const bucket = s === 'kept' ? 'kept' : s === 'derived' || s === 'would derive' ? 'derived' : 'generated'
    coverStats[bucket]++
    if (bucket !== 'kept') refreshedCovers.add(coverPath)
    if (bucket === 'derived') process.stdout.write(`cover ${coverStats.derived}: ${album.title}\r`)
  } catch (e) {
    failures.push({ job: `${artist.name} / ${album.title} / cover`, error: e.message })
  }
}
console.log(`covers: ${coverStats.copied} copied, ${coverStats.derived} derived, ${coverStats.generated} generated, ${coverStats.kept} kept`)

let done = 0
const trackStats = { kept: 0, encoded: 0, 'would encode': 0, 're-covered': 0 }
const results = await pmap(jobs, JOBS, async (job) => {
  try {
    const r = await encodeTrack({ ...job, coverRefreshed: refreshedCovers.has(job.coverPath) })
    trackStats[r.status]++
    if (++done % 25 === 0 || done === jobs.length) process.stdout.write(`tracks: ${done}/${jobs.length}\r`)
    return r
  } catch (e) {
    failures.push({ job: `${job.artist.name} / ${job.album.title} / ${job.track.title}`, error: e.message })
    return null
  }
})
console.log(`\ntracks: ${trackStats.encoded} encoded, ${trackStats['re-covered']} re-covered, ${trackStats.kept} kept${DRY ? `, ${trackStats['would encode']} would encode` : ''}`)

// ReplayGain for flagged FLAC albums (album + track gain via metaflac)
let rg = 0
for (const { album, dir } of albums) {
  if (!album.replaygain || (album.format || 'flac') !== 'flac' || DRY) continue
  const files = results.filter((r) => r && r.file.startsWith(dir + '/') && r.file.endsWith('.flac')).map((r) => r.file)
  if (files.length) { await run('metaflac', ['--add-replay-gain', ...files]); rg++ }
}
console.log(`replaygain: ${rg} albums tagged`)

const podcasts = []
for (const show of lib.podcasts || []) podcasts.push(await makePodcast(show))
for (const p of podcasts) console.log(`podcast: ${p.show} → ${p.feed}`)

if (!DRY) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    out: OUT,
    library: join(OUT, 'library'),
    podcastsHost: HOST,
    artists: artists.length,
    albums: albums.length,
    tracks: results.filter(Boolean).length,
    albumsList: albums.map(({ artist, album, dir }) => ({ artist: artist.name, album: album.title, year: album.year, format: album.format || 'flac', hires: !!album.hires, replaygain: !!album.replaygain, dir })),
    podcasts: podcasts.map((p) => ({ show: p.show, feed: p.feed }))
  }
  await writeFile(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
}

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`)
  for (const f of failures) console.error(`- ${f.job}\n  ${f.error.split('\n')[0]}`)
  process.exit(1)
}
console.log(`\nDone. Point Oscine at ${join(OUT, 'library')}; run \`node tools/capture/serve.mjs\` for the podcast feeds.`)
