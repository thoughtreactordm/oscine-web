/**
 * Build-time "album bloom": a 32px-wide WebP of a screenshot, inlined as a data
 * URI by the `?bloom` Vite plugin in astro.config.ts. Stretched to the frame and
 * blurred in CSS it becomes an ambient wash of that shot's own colors — the same
 * trick Oscine plays with the cover of the track you are hearing. Each one is
 * 120-250 bytes, so it costs a string instead of a second image request.
 *
 * Server only: import from .astro frontmatter, never from a .vue component.
 */

const washes = import.meta.glob<string>('../assets/screenshots/**/*.png', {
  query: '?bloom',
  import: 'default',
  eager: true
})

/** `key` is the shot's path under src/assets/screenshots, minus the extension. */
export function bloom(key: string): string {
  const wash = washes[`../assets/screenshots/${key}.png`]
  if (!wash) {
    throw new Error(`No screenshot at src/assets/screenshots/${key}.png to bloom.`)
  }
  return wash
}
