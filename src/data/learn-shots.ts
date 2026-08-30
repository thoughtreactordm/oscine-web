import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

export type LearnSegment =
  | { type: 'markdown'; value: string }
  | { type: 'shot'; key: string }

const SHOT_COMMENT = /<!--\s*shot:\s*([a-z0-9-]+)\s*-->/gi

/** Alt text: one plain sentence of what is on screen, not the surface name. */
export const SHOT_ALTS: Record<string, string> = {
  'library-hero': "Oscine's library with the sidebar, a song list, and the now-playing bar.",
  'tunedeck-artist': 'The right-hand drawer open on the Artist tab beside the song list.',
  'tunedeck-track':
    'The right-hand drawer open on the Track tab, showing format, ReplayGain, and play counts.',
  'tunedeck-related':
    'The right-hand drawer on Related, listing the rest of the album and looser matches.',
  'tunedeck-playing': 'The right-hand drawer on Playing, with the queue and a recent trail.',
  'theme-oscine-dark': 'The library window in a dark amber-on-taupe look.',
  'theme-oscine-light': 'The library window in a light amber-on-taupe look.',
  'theme-nocturne': 'The library window in a cold blue-grey look.',
  'theme-editor':
    'A Theme tokens window listing color-role ramps, with a WCAG check at the foot.',
  'curate-discover': 'Playlists on a left rail and Discover shelves of album cards.',
  stage: 'Now Playing filling the window with album art and a waveform ribbon.',
  zen: 'Fullscreen Now Playing with the title bar and transport dropped.',
  stats: 'A listening dashboard of totals, ranges, and ranked artists.',
  podcasts: 'A shows list with episode downloads beside an empty player.',
  'tools-writeback': 'A review table of staged tag edits before writing them to files.',
  palette: 'A command palette over the library, opened with Ctrl+K.',
  'quick-menu': 'A left-hand menu from Now Playing with recent additions.',
  onboarding: 'A first-run dialog over an empty library, asking to add a music folder.',
  'track-info': 'A track details window showing format, ReplayGain, and file info.',
  'pillar-columns': 'The song list showing sortable Title, Artist, Album, and Time columns.',
  'pillar-stage': 'Now Playing filling the window with album art and a waveform ribbon.',
  'pillar-theme-picker': 'The Theme tokens window with color-role ramps.',
  'column-chooser':
    'The Songs toolbar with Title, Artist, Album, and Time headers above the track list.',
  og: "Oscine's library with the sidebar, a song list, and the now-playing bar.",
  'themes-trio': 'Three library windows side by side in dark, light, and blue-grey looks.'
}

export function shotAlt(key: string): string {
  const alt = SHOT_ALTS[key]
  if (!alt) {
    throw new Error(
      `No alt text for screenshot key "${key}". Add it to SHOT_ALTS in src/data/learn-shots.ts.`
    )
  }
  return alt
}

export function parseLearnBody(body: string): LearnSegment[] {
  const segments: LearnSegment[] = []
  let lastIndex = 0
  const re = new RegExp(SHOT_COMMENT.source, 'gi')
  for (const match of body.matchAll(re)) {
    const markdown = body.slice(lastIndex, match.index)
    if (markdown.trim()) segments.push({ type: 'markdown', value: markdown })
    segments.push({ type: 'shot', key: match[1] })
    lastIndex = (match.index ?? 0) + match[0].length
  }
  const rest = body.slice(lastIndex)
  if (rest.trim()) segments.push({ type: 'markdown', value: rest })
  return segments
}

export function renderLearnHtml(markdown: string): string {
  const parsed = marked.parse(markdown, { async: false })
  if (typeof parsed !== 'string') {
    throw new Error('marked.parse returned a Promise')
  }

  return sanitizeHtml(parsed, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags.filter((tag) => tag !== 'img'), 'kbd'],
    allowedAttributes: {
      a: ['href', 'title'],
      code: ['class']
    },
    allowedSchemes: ['http', 'https', 'mailto']
  })
}
