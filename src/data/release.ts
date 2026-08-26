export const GITHUB_REPO = 'thoughtreactordm/oscine'
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`
export const RELEASES_URL = `${GITHUB_URL}/releases/latest`

export interface Release {
  version: string
  tag: string
  htmlUrl: string
  windows: string | null
  appImage: string | null
  deb: string | null
}

const FALLBACK: Release = {
  version: '0.8.2',
  tag: 'v0.8.2',
  htmlUrl: `${GITHUB_URL}/releases/tag/v0.8.2`,
  windows: `${GITHUB_URL}/releases/download/v0.8.2/Oscine-Setup-0.8.2.exe`,
  appImage: `${GITHUB_URL}/releases/download/v0.8.2/Oscine-0.8.2.AppImage`,
  deb: `${GITHUB_URL}/releases/download/v0.8.2/oscine_0.8.2_amd64.deb`
}

interface GithubAsset {
  name: string
  browser_download_url: string
}

interface GithubRelease {
  tag_name: string
  html_url: string
  assets: GithubAsset[]
}

function pick(assets: GithubAsset[], test: (name: string) => boolean): string | null {
  return assets.find((asset) => test(asset.name))?.browser_download_url ?? null
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

    const data = (await response.json()) as GithubRelease
    const assets = data.assets ?? []

    return {
      version: data.tag_name.replace(/^v/, ''),
      tag: data.tag_name,
      htmlUrl: data.html_url,
      windows: pick(assets, (name) => /Setup.*\.exe$/i.test(name) && !name.endsWith('.blockmap')),
      appImage: pick(assets, (name) => name.endsWith('.AppImage')),
      deb: pick(assets, (name) => name.endsWith('.deb'))
    }
  } catch {
    return FALLBACK
  }
}
