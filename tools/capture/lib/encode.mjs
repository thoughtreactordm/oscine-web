/**
 * encode.mjs — frames in, video out.
 *
 * Recording pipes each screenshot straight into ffmpeg, which writes a
 * lossless FFV1 master (`<capture-root>/video/<flow>.mkv`): 2560×1640 RGB at
 * the flow's frame rate. Everything the site ships is derived from it, so a
 * different size or quality is a re-encode (`record.mjs --reencode`), not a
 * re-record:
 *
 *   <flow>.webm        AV1 (SVT-AV1), 10-bit 4:2:0 — 10-bit keeps the dark
 *                      gradients and visualizer washes from banding
 *   <flow>.mp4         H.264 High, 8-bit 4:2:0, +faststart — the fallback for
 *                      browsers without AV1 (most Safari)
 *   <flow>.poster.jpg  one frame, for <video poster> and reduced motion
 *
 * Colour: the screenshots are sRGB; the RGB→YUV conversion uses the BT.709
 * matrix at limited range and the streams are tagged BT.709, which is what
 * every browser assumes for HD video anyway. Untagged or BT.601 output shifts
 * the accent colours visibly.
 */

import { spawn } from 'node:child_process'

function ffmpeg(args, { stdin = 'ignore' } = {}) {
  const child = spawn('ffmpeg', ['-hide_banner', '-v', 'error', '-y', ...args], {
    stdio: [stdin, 'ignore', 'pipe']
  })
  let stderr = ''
  child.stderr.on('data', (chunk) => {
    stderr = (stderr + chunk).slice(-4000)
  })
  const done = new Promise((resolveDone, reject) => {
    child.on('error', reject)
    child.on('close', (code) =>
      code === 0 ? resolveDone() : reject(new Error(`ffmpeg exited ${code}: ${stderr.trim()}`))
    )
  })
  return { child, done }
}

/**
 * Open a lossless master for writing. Returns `{ write(buffer), close() }`;
 * `write` respects back-pressure so a slow encoder never balloons memory.
 */
export function openMaster(file, { fps, format }) {
  const { child, done } = ffmpeg(
    [
      '-f', 'image2pipe',
      '-c:v', format === 'jpeg' ? 'mjpeg' : 'png',
      '-framerate', String(fps),
      '-i', '-',
      '-c:v', 'ffv1', '-level', '3', '-g', '1', '-slices', '16', '-slicecrc', '1',
      // JPEG frames decode to full-range YUV; keep everything RGB in the master.
      '-pix_fmt', 'bgr0',
      file
    ],
    { stdin: 'pipe' }
  )
  let failed = null
  done.catch((error) => {
    failed = error
  })
  return {
    async write(buffer) {
      if (failed) throw failed
      if (!child.stdin.write(buffer)) {
        await new Promise((resolveDrain, reject) => {
          child.stdin.once('drain', resolveDrain)
          done.catch(reject)
        })
      }
    },
    async close() {
      child.stdin.end()
      await done
    }
  }
}

const COLOUR_TAGS = ['-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv']

// The tags go on the frames too (setparams): recent ffmpeg takes the encoder's
// colour description from the frames, and scale leaves primaries/transfer unset.
const scale = (width, pixFmt) =>
  `scale=${width}:-2:flags=lanczos+accurate_rnd+full_chroma_int:out_color_matrix=bt709:out_range=tv,` +
  `format=${pixFmt},setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv`

/**
 * Encode the shipped files from a master.
 *
 * @param master   path to the FFV1 master
 * @param outBase  output path without extension (…/src/assets/video/<flow>)
 * @param options  { width, posterAt (seconds), av1Crf, h264Crf }
 */
export async function encodeDeliverables(master, outBase, { width = 1920, posterAt = 0, av1Crf = 34, h264Crf = 21 } = {}) {
  const av1 = ffmpeg([
    '-i', master,
    '-vf', scale(width, 'yuv420p10le'),
    '-c:v', 'libsvtav1', '-preset', '5', '-crf', String(av1Crf),
    '-g', '240', '-svtav1-params', 'tune=0',
    ...COLOUR_TAGS,
    '-an', `${outBase}.webm`
  ])
  const h264 = ffmpeg([
    '-i', master,
    '-vf', scale(width, 'yuv420p'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(h264Crf),
    '-profile:v', 'high', '-tune', 'animation', '-g', '240',
    ...COLOUR_TAGS,
    '-movflags', '+faststart',
    '-an', `${outBase}.mp4`
  ])
  const poster = ffmpeg([
    '-ss', String(posterAt), '-i', master,
    '-frames:v', '1',
    '-vf', `scale=${width}:-2:flags=lanczos`,
    '-q:v', '3',
    `${outBase}.poster.jpg`
  ])
  await Promise.all([av1.done, h264.done, poster.done])
}
