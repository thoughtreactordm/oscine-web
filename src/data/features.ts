/**
 * The Features pages: five tabs, each a route of its own under /features, and
 * the sections each one composes. The section ids are the page anchors, so they
 * are also what the /features redirect resolves old `/features#id` links to.
 */

export type SectionId =
  | 'library'
  | 'podcasts'
  | 'playback'
  | 'stage'
  | 'lyrics'
  | 'visualizers'
  | 'equalizer'
  | 'tunedeck'
  | 'curate-discover'
  | 'stats'
  | 'scrobbling'
  | 'tag-editing'
  | 'replaygain'
  | 'cd-ripping'
  | 'agent-access'
  | 'themes'
  | 'noctalia'
  | 'quick-access'

export interface FeatureTab {
  slug: string
  label: string
  title: string
  description: string
  /** Shorter line for the page's meta description. */
  meta: string
  sections: readonly SectionId[]
}

export const FEATURE_TABS: readonly FeatureTab[] = [
  {
    slug: 'library',
    label: 'Library',
    title: 'Your library.',
    description:
      "Browse, sort, and search the music you own. Podcasts get a tab of their own so they stay out of your music's way.",
    meta: "Browse Oscine's library by artist, album, and genre, choose your own columns, search instantly, and keep podcasts separate from your music.",
    sections: ['library', 'podcasts']
  },
  {
    slug: 'listening',
    label: 'Listening',
    title: 'Listening.',
    description: 'How Oscine plays your music, and everything it can show you while it does.',
    meta: 'Gapless playback and crossfade, the Stage and Zen mode, synced lyrics, visualizers, and a parametric equalizer in Oscine.',
    sections: ['playback', 'stage', 'lyrics', 'visualizers', 'equalizer']
  },
  {
    slug: 'explore',
    label: 'Explore',
    title: 'Explore.',
    description:
      "Ways back into music you already own, and a record of what you've been playing.",
    meta: "Oscine's Tunedeck, playlists and Discover shelves, listening stats, Last.fm and ListenBrainz scrobbling, and Discord presence.",
    sections: ['tunedeck', 'curate-discover', 'stats', 'scrobbling']
  },
  {
    slug: 'tools',
    label: 'Tools',
    title: 'Tools.',
    description: 'Fix your tags, even out the volume, and rip your CDs without leaving the app.',
    meta: "Oscine's tag editor with reviewed write-back, ReplayGain measurement, CD ripping to FLAC, and optional agent access.",
    sections: ['tag-editing', 'replaygain', 'cd-ripping', 'agent-access']
  },
  {
    slug: 'make-it-yours',
    label: 'Make it yours',
    title: 'Make it yours.',
    description: 'Themes, colors, and shortcuts so Oscine looks and works the way you want it to.',
    meta: "Oscine's themes and theme editor, Noctalia color sync on Linux, the command palette, the Quick Menu, and keyboard shortcuts.",
    sections: ['themes', 'noctalia', 'quick-access']
  }
]

export const DEFAULT_TAB = FEATURE_TABS[0]

/** Anchors the single-page tour used that no longer match a section id. */
export const LEGACY_ANCHORS: Readonly<Record<string, SectionId>> = {
  discord: 'scrobbling'
}

export function featureTabHref(tab: FeatureTab): string {
  return `/features/${tab.slug}`
}

/** Where `/features#<anchor>` lives now, or undefined for an anchor we don't know. */
export function featureAnchorHref(anchor: string): string | undefined {
  const id = (LEGACY_ANCHORS[anchor] ?? anchor) as SectionId
  const tab = FEATURE_TABS.find((t) => t.sections.includes(id))
  return tab ? `${featureTabHref(tab)}#${id}` : undefined
}

/** Every anchor `/features` can redirect, flattened for the inline script there. */
export function featureAnchorMap(): Record<string, string> {
  const map: Record<string, string> = {}
  const anchors = [...FEATURE_TABS.flatMap((t) => t.sections), ...Object.keys(LEGACY_ANCHORS)]
  for (const anchor of anchors) map[anchor] = featureAnchorHref(anchor)!
  return map
}
