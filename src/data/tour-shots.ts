/**
 * Screenshots for the Features tabs. Astro-only: it imports the PNGs and runs
 * them through astro:assets, so each tab builds just the shots its sections use.
 */
import { getImage } from 'astro:assets'
import type { ImageMetadata } from 'astro'
import type { TourShotAsset } from '../components/TourShot.vue'
import { bloom } from './bloom'
import type { SectionId } from './features'
import libraryHero from '../assets/screenshots/library-hero.png'
import tunedeckArtist from '../assets/screenshots/tunedeck-artist.png'
import tunedeckRelated from '../assets/screenshots/tunedeck-related.png'
import themeOscineDark from '../assets/screenshots/theme-oscine-dark.png'
import themeOscineLight from '../assets/screenshots/theme-oscine-light.png'
import themeNocturne from '../assets/screenshots/theme-nocturne.png'
import themeEditor from '../assets/screenshots/theme-editor.png'
import curateDiscover from '../assets/screenshots/curate-discover.png'
import stage from '../assets/screenshots/stage.png'
import zen from '../assets/screenshots/zen.png'
import trackInfo from '../assets/screenshots/crops/track-info.png'
import stats from '../assets/screenshots/stats.png'
import podcasts from '../assets/screenshots/podcasts.png'
import toolsWriteback from '../assets/screenshots/tools-writeback.png'
import toolsEqualizer from '../assets/screenshots/tools-equalizer.png'
import toolsCdrip from '../assets/screenshots/tools-cdrip.png'
import tagEditor from '../assets/screenshots/tag-editor.png'
import palette from '../assets/screenshots/palette.png'
import quickMenu from '../assets/screenshots/quick-menu.png'

/** Each shot with its path under src/assets/screenshots, minus the extension (the bloom key). */
const SHOTS = {
  libraryHero: [libraryHero, 'library-hero'],
  tunedeckArtist: [tunedeckArtist, 'tunedeck-artist'],
  tunedeckRelated: [tunedeckRelated, 'tunedeck-related'],
  themeOscineDark: [themeOscineDark, 'theme-oscine-dark'],
  themeOscineLight: [themeOscineLight, 'theme-oscine-light'],
  themeNocturne: [themeNocturne, 'theme-nocturne'],
  themeEditor: [themeEditor, 'theme-editor'],
  curateDiscover: [curateDiscover, 'curate-discover'],
  stage: [stage, 'stage'],
  zen: [zen, 'zen'],
  trackInfo: [trackInfo, 'crops/track-info'],
  stats: [stats, 'stats'],
  podcasts: [podcasts, 'podcasts'],
  toolsWriteback: [toolsWriteback, 'tools-writeback'],
  toolsEqualizer: [toolsEqualizer, 'tools-equalizer'],
  toolsCdrip: [toolsCdrip, 'tools-cdrip'],
  tagEditor: [tagEditor, 'tag-editor'],
  palette: [palette, 'palette'],
  quickMenu: [quickMenu, 'quick-menu']
} satisfies Record<string, [ImageMetadata, string]>

export type ShotKey = keyof typeof SHOTS

/** Only the shots the current tab's sections asked for are filled in. */
export type TourShots = Record<ShotKey, TourShotAsset>

const SECTION_SHOTS: Record<SectionId, readonly ShotKey[]> = {
  library: ['libraryHero'],
  podcasts: ['podcasts'],
  playback: ['trackInfo'],
  stage: ['stage', 'zen'],
  lyrics: [],
  visualizers: [],
  equalizer: ['toolsEqualizer'],
  tunedeck: ['tunedeckArtist', 'tunedeckRelated'],
  'curate-discover': ['curateDiscover'],
  stats: ['stats'],
  scrobbling: [],
  'tag-editing': ['tagEditor', 'toolsWriteback'],
  replaygain: [],
  'cd-ripping': ['toolsCdrip'],
  'agent-access': [],
  themes: ['themeOscineDark', 'themeOscineLight', 'themeNocturne', 'themeEditor'],
  noctalia: [],
  'quick-access': ['palette', 'quickMenu']
}

const SHOT_WIDTHS = [1280, 1920] as const

async function tourShot([src, key]: [ImageMetadata, string]): Promise<TourShotAsset> {
  const [webp, avif] = await Promise.all([
    getImage({ src, widths: [...SHOT_WIDTHS], format: 'webp' }),
    getImage({ src, widths: [...SHOT_WIDTHS], format: 'avif' })
  ])
  return {
    src: webp.src,
    srcSet: webp.srcSet.attribute,
    avifSrcSet: avif.srcSet.attribute,
    bloom: bloom(key),
    width: Number(webp.attributes.width) || SHOT_WIDTHS[0],
    height: Number(webp.attributes.height) || Math.round(SHOT_WIDTHS[0] * (src.height / src.width))
  }
}

export async function loadTourShots(sections: readonly SectionId[]): Promise<TourShots> {
  const keys = [...new Set(sections.flatMap((id) => SECTION_SHOTS[id]))]
  const assets = await Promise.all(keys.map((key) => tourShot(SHOTS[key])))
  return Object.fromEntries(keys.map((key, i) => [key, assets[i]])) as TourShots
}
