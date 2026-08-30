import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  completeMatch,
  downloadTargets,
  formatBytes,
  matchReleaseAssets,
  parseSha256,
  type GithubAsset
} from './release.ts'

const RC3_ASSETS: GithubAsset[] = [
  {
    name: 'Oscine-v1.0.0-rc.3-linux.tar.gz',
    browser_download_url:
      'https://github.com/thoughtreactordm/oscine/releases/download/v1.0.0-rc.3/Oscine-v1.0.0-rc.3-linux.tar.gz',
    size: 274632086,
    digest: 'sha256:a9ac4599a5e8739902ff66741778819845a892a7218c415dec58e0685478f6d2'
  },
  {
    name: 'Oscine.Setup.1.0.0-rc.3.exe',
    browser_download_url:
      'https://github.com/thoughtreactordm/oscine/releases/download/v1.0.0-rc.3/Oscine.Setup.1.0.0-rc.3.exe',
    size: 123031881,
    digest: 'sha256:684ba418002d5548c3347f622fb75d9530bc09956eb1c1d298aaa28b3f262fc2'
  }
]

const SEPARATE_ASSETS: GithubAsset[] = [
  {
    name: 'Oscine.Setup.1.0.0.exe',
    browser_download_url:
      'https://github.com/thoughtreactordm/oscine/releases/download/v1.0.0/Oscine.Setup.1.0.0.exe',
    size: 120000000,
    digest: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  },
  {
    name: 'Oscine.Setup.1.0.0.exe.blockmap',
    browser_download_url:
      'https://github.com/thoughtreactordm/oscine/releases/download/v1.0.0/Oscine.Setup.1.0.0.exe.blockmap',
    size: 120000,
    digest: 'sha256:bbbbbbbbaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  },
  {
    name: 'latest.yml',
    browser_download_url:
      'https://github.com/thoughtreactordm/oscine/releases/download/v1.0.0/latest.yml',
    size: 400
  },
  {
    name: 'Oscine-1.0.0.AppImage',
    browser_download_url:
      'https://github.com/thoughtreactordm/oscine/releases/download/v1.0.0/Oscine-1.0.0.AppImage',
    size: 180000000,
    digest: 'sha256:ccccccccccccccccaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  },
  {
    name: 'oscine_1.0.0_amd64.deb',
    browser_download_url:
      'https://github.com/thoughtreactordm/oscine/releases/download/v1.0.0/oscine_1.0.0_amd64.deb',
    size: 175000000,
    digest: 'sha256:ddddddddaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  }
]

describe('parseSha256', () => {
  it('strips the GitHub sha256: prefix', () => {
    assert.equal(
      parseSha256('sha256:684ba418002d5548c3347f622fb75d9530bc09956eb1c1d298aaa28b3f262fc2'),
      '684ba418002d5548c3347f622fb75d9530bc09956eb1c1d298aaa28b3f262fc2'
    )
  })

  it('returns null for missing or non-sha256 digests', () => {
    assert.equal(parseSha256(null), null)
    assert.equal(parseSha256('md5:abc'), null)
  })
})

describe('matchReleaseAssets', () => {
  it('matches the rc.3 two-asset tarball shape', () => {
    const matched = matchReleaseAssets(RC3_ASSETS)
    assert.ok(completeMatch(matched))
    assert.equal(matched.windows.name, 'Oscine.Setup.1.0.0-rc.3.exe')
    assert.equal(
      matched.windows.sha256,
      '684ba418002d5548c3347f622fb75d9530bc09956eb1c1d298aaa28b3f262fc2'
    )
    assert.equal(matched.linux.kind, 'archive')
    if (matched.linux.kind !== 'archive') return
    assert.equal(matched.linux.asset.name, 'Oscine-v1.0.0-rc.3-linux.tar.gz')
    assert.equal(
      matched.linux.asset.sha256,
      'a9ac4599a5e8739902ff66741778819845a892a7218c415dec58e0685478f6d2'
    )

    const targets = downloadTargets({
      version: '1.0.0-rc.3',
      tag: 'v1.0.0-rc.3',
      htmlUrl: 'https://github.com/thoughtreactordm/oscine/releases/tag/v1.0.0-rc.3',
      windows: matched.windows,
      linux: matched.linux
    })
    assert.deepEqual(
      targets.map((target) => target.id),
      ['windows', 'linux']
    )
  })

  it('matches separate AppImage and .deb assets and ignores sidecars', () => {
    const matched = matchReleaseAssets(SEPARATE_ASSETS)
    assert.ok(completeMatch(matched))
    assert.equal(matched.windows.name, 'Oscine.Setup.1.0.0.exe')
    assert.equal(matched.linux.kind, 'packages')
    if (matched.linux.kind !== 'packages') return
    assert.equal(matched.linux.appImage.name, 'Oscine-1.0.0.AppImage')
    assert.equal(matched.linux.deb.name, 'oscine_1.0.0_amd64.deb')

    const targets = downloadTargets({
      version: '1.0.0',
      tag: 'v1.0.0',
      htmlUrl: 'https://github.com/thoughtreactordm/oscine/releases/tag/v1.0.0',
      windows: matched.windows,
      linux: matched.linux
    })
    assert.deepEqual(
      targets.map((target) => target.id),
      ['windows', 'appImage', 'deb']
    )
  })

  it('prefers separate packages when a tarball is also present', () => {
    const matched = matchReleaseAssets([
      ...RC3_ASSETS,
      {
        name: 'Oscine-1.0.0-rc.3.AppImage',
        browser_download_url:
          'https://github.com/thoughtreactordm/oscine/releases/download/v1.0.0-rc.3/Oscine-1.0.0-rc.3.AppImage',
        size: 1,
        digest: 'sha256:eeeeeeeeaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      },
      {
        name: 'oscine_1.0.0-rc.3_amd64.deb',
        browser_download_url:
          'https://github.com/thoughtreactordm/oscine/releases/download/v1.0.0-rc.3/oscine_1.0.0-rc.3_amd64.deb',
        size: 1,
        digest: 'sha256:ffffffffaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      }
    ])
    assert.equal(matched.linux?.kind, 'packages')
  })

  it('returns nulls when neither shape matches', () => {
    const matched = matchReleaseAssets([
      {
        name: 'latest.yml',
        browser_download_url: 'https://example.invalid/latest.yml',
        size: 12
      }
    ])
    assert.equal(matched.windows, null)
    assert.equal(matched.linux, null)
    assert.equal(completeMatch(matched), false)
  })
})

describe('formatBytes', () => {
  it('formats the rc.3 installer and tarball sizes', () => {
    assert.equal(formatBytes(123031881), '117 MB')
    assert.equal(formatBytes(274632086), '262 MB')
  })
})
