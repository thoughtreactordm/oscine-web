import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { GITHUB_REPO } from './release.ts'

const RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases`
const PER_PAGE = 100
const MAX_PAGES = 20

export interface ChangelogRelease {
  version: string
  tag: string
  htmlUrl: string
  publishedAt: string
  prerelease: boolean
  html: string
}

interface GithubRelease {
  tag_name: string
  html_url: string
  body: string | null
  draft: boolean
  prerelease: boolean
  published_at: string | null
  created_at: string
}

const BY_AUTHOR_SUFFIX = /[ \t]+by @[A-Za-z0-9-]+ in https?:\/\/[^\s<]+/g
const FULL_CHANGELOG_LINE =
  /^[ \t]*(?:\*{0,2}Full Changelog\*{0,2}[ \t]*:[ \t]*)https?:\/\/\S+[ \t]*$/gim
const WHATS_CHANGED_HEADING = /^[ \t]*#{1,6}[ \t]*What's Changed[ \t]*$/gim
const NEW_CONTRIBUTORS_SECTION = /^#{1,6}[ \t]*New Contributors[ \t]*\n(?:^(?!#).*\n?)*/gim

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'oscine-web'
  }
  const token = process.env.GITHUB_TOKEN
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export function cleanReleaseBody(body: string): string {
  const stripped = body
    .replaceAll('\r\n', '\n')
    .replace(BY_AUTHOR_SUFFIX, '')
    .replace(FULL_CHANGELOG_LINE, '')
    .replace(WHATS_CHANGED_HEADING, '')
    .replace(NEW_CONTRIBUTORS_SECTION, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return stripped
}

export function renderReleaseHtml(body: string | null | undefined): string {
  const cleaned = cleanReleaseBody(body ?? '')
  if (!cleaned) return ''

  const parsed = marked.parse(cleaned, { async: false })
  if (typeof parsed !== 'string') {
    throw new Error('marked.parse returned a Promise')
  }

  return sanitizeHtml(parsed, {
    allowedTags: sanitizeHtml.defaults.allowedTags.filter((tag) => tag !== 'img'),
    allowedAttributes: {
      a: ['href', 'title'],
      code: ['class']
    },
    allowedSchemes: ['http', 'https', 'mailto']
  })
}

export async function getReleases(): Promise<ChangelogRelease[]> {
  const fetched: GithubRelease[] = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${RELEASES_API}?per_page=${PER_PAGE}&page=${page}`
    const response = await fetch(url, { headers: githubHeaders() })
    if (!response.ok) {
      throw new Error(
        `GitHub releases fetch failed (${response.status} ${response.statusText}) for ${url}`
      )
    }

    const batch = (await response.json()) as unknown
    if (!Array.isArray(batch)) {
      throw new Error(`GitHub releases fetch returned a non-array payload for ${url}`)
    }

    fetched.push(...(batch as GithubRelease[]))
    if (batch.length < PER_PAGE) break
  }

  return fetched
    .filter((release) => !release.draft)
    .map((release) => ({
      version: release.tag_name.replace(/^v/, ''),
      tag: release.tag_name,
      htmlUrl: release.html_url,
      publishedAt: release.published_at ?? release.created_at,
      prerelease: release.prerelease,
      html: renderReleaseHtml(release.body)
    }))
}
