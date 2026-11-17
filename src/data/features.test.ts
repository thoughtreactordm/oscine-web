import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { FEATURE_TABS, featureAnchorHref, featureAnchorMap } from './features.ts'

describe('feature tabs', () => {
  it('gives every section exactly one tab', () => {
    const ids = FEATURE_TABS.flatMap((t) => t.sections)
    assert.equal(new Set(ids).size, ids.length)
  })

  it('has unique slugs', () => {
    const slugs = FEATURE_TABS.map((t) => t.slug)
    assert.equal(new Set(slugs).size, slugs.length)
  })
})

describe('old /features anchors', () => {
  // Every anchor the single-page tour ever had. The home page, Learn and
  // outside sites link to these.
  const OLD = {
    equalizer: '/features/listening#equalizer',
    'cd-ripping': '/features/tools#cd-ripping',
    'tag-editing': '/features/tools#tag-editing',
    replaygain: '/features/tools#replaygain',
    lyrics: '/features/listening#lyrics',
    discord: '/features/explore#scrobbling'
  }

  for (const [anchor, href] of Object.entries(OLD)) {
    it(`sends #${anchor} to ${href}`, () => {
      assert.equal(featureAnchorHref(anchor), href)
    })
  }

  it('leaves unknown anchors alone', () => {
    assert.equal(featureAnchorHref('nope'), undefined)
  })

  it('maps every section and old anchor for the redirect script', () => {
    const map = featureAnchorMap()
    for (const [anchor, href] of Object.entries(OLD)) assert.equal(map[anchor], href)
    for (const tab of FEATURE_TABS)
      for (const id of tab.sections) assert.equal(map[id], `/features/${tab.slug}#${id}`)
  })
})
