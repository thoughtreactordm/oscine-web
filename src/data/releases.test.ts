import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { cleanReleaseBody, renderReleaseHtml } from './releases.ts'

const RC3_BODY = `## What's Changed
* feat(scrobble): ListenBrainz as the second scrobble target (W11-8) by @mdelally in https://github.com/thoughtreactordm/oscine/pull/20
* 1.0 RC: responsive & layout polish by @mdelally in https://github.com/thoughtreactordm/oscine/pull/21


**Full Changelog**: https://github.com/thoughtreactordm/oscine/compare/v1.0.0-rc.2...v1.0.0-rc.3
`

const FIRST_RELEASE_BODY = `## What's Changed
* W6-1: tooling baseline — lint, format, Vitest, CI matrix by @mdelally in https://github.com/thoughtreactordm/oscine/pull/1
* chore: fix broken windows build; add stages for release builds using … by @mdelally in https://github.com/thoughtreactordm/oscine/pull/2

## New Contributors
* @mdelally made their first contribution in https://github.com/thoughtreactordm/oscine/pull/1


**Full Changelog**: https://github.com/thoughtreactordm/oscine/commits/v0.8.2
`

const HANDWRITTEN_BODY = `## Highlights
ReplayGain now measures in the background.

Thanks to @testers for trying the RCs.

**Full Changelog**: https://github.com/thoughtreactordm/oscine/compare/v1.0.0-rc.3...v1.0.0
`

describe('cleanReleaseBody', () => {
  it('turns the auto-generated PR list into plain bullets without handles or compare URLs', () => {
    const cleaned = cleanReleaseBody(RC3_BODY)
    assert.equal(
      cleaned,
      `* feat(scrobble): ListenBrainz as the second scrobble target (W11-8)
* 1.0 RC: responsive & layout polish`
    )
    assert.doesNotMatch(cleaned, /@mdelally/)
    assert.doesNotMatch(cleaned, /compare/)
    assert.doesNotMatch(cleaned, /Full Changelog/)
    assert.doesNotMatch(cleaned, /What's Changed/)
  })

  it('drops the New Contributors section and commit-list changelog line', () => {
    const cleaned = cleanReleaseBody(FIRST_RELEASE_BODY)
    assert.equal(
      cleaned,
      `* W6-1: tooling baseline — lint, format, Vitest, CI matrix
* chore: fix broken windows build; add stages for release builds using …`
    )
    assert.doesNotMatch(cleaned, /@mdelally/)
    assert.doesNotMatch(cleaned, /New Contributors/)
  })

  it('keeps handwritten notes and only strips the Full Changelog line', () => {
    const cleaned = cleanReleaseBody(HANDWRITTEN_BODY)
    assert.match(cleaned, /## Highlights/)
    assert.match(cleaned, /Thanks to @testers/)
    assert.doesNotMatch(cleaned, /Full Changelog/)
    assert.doesNotMatch(cleaned, /compare/)
  })

  it('returns an empty string for empty input', () => {
    assert.equal(cleanReleaseBody(''), '')
    assert.equal(cleanReleaseBody('   \n  '), '')
  })
})

describe('renderReleaseHtml', () => {
  it('renders cleaned auto-generated notes as a list with no handles or compare URLs', () => {
    const html = renderReleaseHtml(RC3_BODY)
    assert.match(html, /<li>/)
    assert.match(html, /ListenBrainz/)
    assert.doesNotMatch(html, /@mdelally/)
    assert.doesNotMatch(html, /compare/)
    assert.doesNotMatch(html, /<script/)
  })

  it('returns an empty string when the body is missing', () => {
    assert.equal(renderReleaseHtml(null), '')
    assert.equal(renderReleaseHtml(undefined), '')
  })
})
