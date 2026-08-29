---
taskId: 01M17HPAQSBTPW2AYX4SJSGQWG
title: 'Sitemap, per-page titles/meta, OG defaults'
status: todo
priority: low
labels:
  - polish
  - seo
workstream: W4
workstreamId: W4-4
workstreamDependsOn:
  - W2
effort: low
order: 18
created: '2026-08-29T19:59:35.673Z'
updated: '2026-08-29T19:59:35.673Z'
---
Spec: `docs/1.0-site-release.md` §7 last bullet.

- Add `@astrojs/sitemap`; `site` is already `https://oscine.app` in `astro.config.ts`. Note the canonical host is `www.oscine.app` (apex 308s to www) — set `site` to match so canonical URLs and the sitemap don't point at the redirecting host.
- Every page passes a specific `title`/`description` to `BaseLayout` (Features, Changelog, each Learn article from frontmatter).
- OG: default image is the `library-hero` 1200×630 crop (from the swap card); `og:url` per page; `twitter:card = summary_large_image`.
- `robots.txt` with the sitemap URL.

**Acceptance**: `dist/sitemap-index.xml` lists every route; a card validator renders the hero image for `/`.
