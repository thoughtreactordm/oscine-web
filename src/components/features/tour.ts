/** Shared layout for the Features section components. */

const alignStart = {
  title: 'text-left',
  description: 'text-left',
  headline: 'justify-start',
  leading: 'justify-start',
  links: 'justify-start'
}

/** Section headings carry the accent; the page header title stays plain. */
export const sectionUi = { ...alignStart, title: 'text-left section-title' }

/** Copy-only sections sit centered at a readable measure and carry the accent too. */
export const centeredUi = { title: 'section-title', description: 'mx-auto max-w-3xl text-pretty' }

/** The shot behind an overlay is narrower than the column, so it asks for less. */
export const sizes = {
  stacked: '(min-width: 1024px) 31rem, 100vw',
  inset: '(min-width: 1024px) 20rem, 100vw',
  half: '(min-width: 1024px) 36rem, 100vw',
  trio: '(min-width: 640px) 22rem, 100vw',
  full: '(min-width: 80rem) 72rem, 100vw'
} as const

/** Overlays sit on top of another shot and need to read that way. */
export const lifted = 'shadow-2xl shadow-black/70'
