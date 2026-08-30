import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { parseLearnBody, renderLearnHtml, shotAlt } from './learn-shots.ts'

const here = dirname(fileURLToPath(import.meta.url))
const learnDir = join(here, '../content/learn')
const mastersDir = join(here, '../assets/screenshots')
const cropsDir = join(here, '../assets/screenshots/crops')
const SHOT_COMMENT = /<!--\s*shot:\s*([a-z0-9-]+)\s*-->/gi

describe('parseLearnBody', () => {
  it('returns one markdown segment when there are no shot comments', () => {
    const segments = parseLearnBody('Hello.\n\n## Next\n\nMore.')
    assert.deepEqual(segments, [{ type: 'markdown', value: 'Hello.\n\n## Next\n\nMore.' }])
  })

  it('splits markdown around shot comments', () => {
    const segments = parseLearnBody(
      'Intro.\n\n<!-- shot: onboarding -->\n\n## Install\n\nDownload.'
    )
    assert.equal(segments.length, 3)
    assert.deepEqual(segments[0], { type: 'markdown', value: 'Intro.\n\n' })
    assert.deepEqual(segments[1], { type: 'shot', key: 'onboarding' })
    assert.equal(segments[2]?.type, 'markdown')
    assert.match((segments[2] as { value: string }).value, /## Install/)
  })

  it('allows adjacent shots and ignores blank markdown between them', () => {
    const segments = parseLearnBody('<!-- shot: palette -->\n\n<!-- shot: quick-menu -->')
    assert.deepEqual(segments, [
      { type: 'shot', key: 'palette' },
      { type: 'shot', key: 'quick-menu' }
    ])
  })
})

describe('shotAlt', () => {
  it('returns a full sentence for a known key', () => {
    assert.match(shotAlt('onboarding'), /folder/)
  })

  it('throws for a key with no alt', () => {
    assert.throws(() => shotAlt('not-a-shot'), /No alt text/)
  })
})

describe('renderLearnHtml', () => {
  it('renders GFM tables and keeps kbd', () => {
    const html = renderLearnHtml('| Prefix | Mode |\n|---|---|\n| `>` | Actions |\n\nUse <kbd>Ctrl</kbd>.')
    assert.match(html, /<table>/)
    assert.match(html, /<kbd>Ctrl<\/kbd>/)
  })

  it('strips images from markdown', () => {
    const html = renderLearnHtml('Hello ![x](http://example.com/x.png)')
    assert.doesNotMatch(html, /<img/)
    assert.match(html, /Hello/)
  })
})

describe('Learn screenshot slots', () => {
  it('every marked shot has alt text and a PNG master or crop', () => {
    const keys = new Set<string>()
    for (const file of readdirSync(learnDir).filter((name) => name.endsWith('.md'))) {
      const body = readFileSync(join(learnDir, file), 'utf8')
      for (const match of body.matchAll(SHOT_COMMENT)) keys.add(match[1])
    }
    assert.ok(keys.size > 0, 'expected at least one Learn screenshot slot')
    for (const key of keys) {
      assert.doesNotThrow(() => shotAlt(key))
      const hasFile =
        existsSync(join(mastersDir, `${key}.png`)) || existsSync(join(cropsDir, `${key}.png`))
      assert.ok(hasFile, `missing PNG for Learn shot "${key}"`)
    }
  })
})
