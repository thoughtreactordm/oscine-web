export const GITHUB_REPO = 'thoughtreactordm/oscine'
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`
export const RELEASES_URL = `${GITHUB_URL}/releases/latest`

export interface ReleaseAsset {
  name: string
  url: string
  size: number | null
  sha256: string | null
}

export type LinuxRelease =
  | { kind: 'archive'; asset: ReleaseAsset }
  | { kind: 'packages'; appImage: ReleaseAsset; deb: ReleaseAsset }

export interface Release {
  version: string
  tag: string
  htmlUrl: string
  windows: ReleaseAsset
  linux: LinuxRelease
}

export interface GithubAsset {
  name: string
  browser_download_url: string
  size?: number
  digest?: string | null
}

export interface MatchedAssets {
  windows: ReleaseAsset | null
  linux: LinuxRelease | null
}

export type DownloadTargetId = 'windows' | 'linux' | 'appImage' | 'deb'

export interface DownloadTarget {
  id: DownloadTargetId
  heading: string
  label: string
  icon: string
  color: 'primary' | 'neutral'
  variant: 'solid' | 'subtle' | 'ghost'
  asset: ReleaseAsset
}

export class UnmatchedReleaseAssetsError extends Error {
  readonly assetNames: string[]

  constructor(assetNames: string[]) {
    const listed = assetNames.length > 0 ? assetNames.join(', ') : '(none)'
    super(`Release has no matching Windows installer or Linux archive/packages: ${listed}`)
    this.name = 'UnmatchedReleaseAssetsError'
    this.assetNames = assetNames
  }
}

const FALLBACK: Release = {
  version: '1.0.0',
  tag: 'v1.0.0',
  htmlUrl: `${GITHUB_URL}/releases/tag/v1.0.0`,
  windows: {
    name: 'Oscine.Setup.1.0.0.exe',
    url: `${GITHUB_URL}/releases/download/v1.0.0/Oscine.Setup.1.0.0.exe`,
    size: null,
    sha256: null
  },
  linux: {
    kind: 'archive',
    asset: {
      name: 'Oscine-v1.0.0-linux.tar.gz',
      url: `${GITHUB_URL}/releases/download/v1.0.0/Oscine-v1.0.0-linux.tar.gz`,
      size: null,
      sha256: null
    }
  }
}

function toAsset(asset: GithubAsset): ReleaseAsset {
  return {
    name: asset.name,
    url: asset.browser_download_url,
    size: typeof asset.size === 'number' ? asset.size : null,
    sha256: parseSha256(asset.digest)
  }
}

export function parseSha256(digest: string | null | undefined): string | null {
  if (!digest) return null
  const match = /^sha256:([a-fA-F0-9]{64})$/.exec(digest)
  return match ? match[1].toLowerCase() : null
}

export function isWindowsInstaller(name: string): boolean {
  return /Setup.+\.exe$/i.test(name) && !name.endsWith('.blockmap')
}

export function isLinuxArchive(name: string): boolean {
  return /linux\.tar\.gz$/i.test(name)
}

export function isLinuxAppImage(name: string): boolean {
  return name.endsWith('.AppImage')
}

export function isLinuxDeb(name: string): boolean {
  return name.endsWith('.deb')
}

export function matchReleaseAssets(assets: GithubAsset[]): MatchedAssets {
  const windowsAsset = assets.find((asset) => isWindowsInstaller(asset.name))
  const appImage = assets.find((asset) => isLinuxAppImage(asset.name))
  const deb = assets.find((asset) => isLinuxDeb(asset.name))
  const archive = assets.find((asset) => isLinuxArchive(asset.name))

  let linux: LinuxRelease | null = null
  if (appImage && deb) {
    linux = { kind: 'packages', appImage: toAsset(appImage), deb: toAsset(deb) }
  } else if (archive) {
    linux = { kind: 'archive', asset: toAsset(archive) }
  }

  return {
    windows: windowsAsset ? toAsset(windowsAsset) : null,
    linux
  }
}

export function completeMatch(
  matched: MatchedAssets
): matched is { windows: ReleaseAsset; linux: LinuxRelease } {
  return matched.windows !== null && matched.linux !== null
}

export function downloadTargets(release: Release): DownloadTarget[] {
  const windows: DownloadTarget = {
    id: 'windows',
    heading: 'Windows',
    label: 'Windows installer',
    icon: 'i-tabler-brand-windows',
    color: 'primary',
    variant: 'solid',
    asset: release.windows
  }

  if (release.linux.kind === 'archive') {
    return [
      windows,
      {
        id: 'linux',
        heading: 'Linux',
        label: 'Linux tarball',
        icon: 'i-tabler-package',
        color: 'neutral',
        variant: 'subtle',
        asset: release.linux.asset
      }
    ]
  }

  return [
    windows,
    {
      id: 'appImage',
      heading: 'Linux AppImage',
      label: 'Linux AppImage',
      icon: 'i-tabler-terminal-2',
      color: 'neutral',
      variant: 'subtle',
      asset: release.linux.appImage
    },
    {
      id: 'deb',
      heading: '.deb',
      label: '.deb',
      icon: 'i-tabler-package',
      color: 'neutral',
      variant: 'ghost',
      asset: release.linux.deb
    }
  ]
}

export function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  if (mb < 1) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${Math.round(mb)} MB`
}

export function debPackageName(version: string): string {
  return `oscine_${version}_amd64.deb`
}

function failOrFallback(assets: GithubAsset[]): Release {
  const names = assets.map((asset) => asset.name)
  const message = new UnmatchedReleaseAssetsError(names).message
  if (import.meta.env.DEV) {
    throw new UnmatchedReleaseAssetsError(names)
  }
  console.warn(message)
  return FALLBACK
}

export async function getLatestRelease(): Promise<Release> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json'
    }
    if (import.meta.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${import.meta.env.GITHUB_TOKEN}`
    }

    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers
    })
    if (!response.ok) return FALLBACK

    const data = (await response.json()) as {
      tag_name: string
      html_url: string
      assets?: GithubAsset[]
    }
    const assets = data.assets ?? []
    const matched = matchReleaseAssets(assets)
    if (!completeMatch(matched)) return failOrFallback(assets)

    return {
      version: data.tag_name.replace(/^v/, ''),
      tag: data.tag_name,
      htmlUrl: data.html_url,
      windows: matched.windows,
      linux: matched.linux
    }
  } catch (error) {
    if (error instanceof UnmatchedReleaseAssetsError) throw error
    return FALLBACK
  }
}
