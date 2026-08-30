---
taskId: 01M17HKS3MBPRHB7X382MV8A57
title: Changelog page + releases.ts
status: in-review
priority: high
labels:
  - design
  - changelog
workstream: W2
workstreamId: W2-2
effort: medium
order: 1
created: '2026-08-29T19:58:12.084Z'
updated: '2026-08-30T02:17:53.112Z'
---
Spec: `docs/1.0-site-release.md` §3.5.

- `src/data/releases.ts`: paginated `GET /repos/thoughtreactordm/oscine/releases` at build time; `GITHUB_TOKEN` optional (public repo) but used when present. Fail the build on fetch error rather than shipping an empty page. Skip drafts; badge pre-releases.
- Post-process bodies before rendering: drop the "Full Changelog" line and the `by @user in <url>` suffixes; keep PR titles as bullets. Render with `marked`, sanitized.
- `src/pages/changelog.astro`: one entry per release (version, date, badge, body, link to the GitHub release for assets). Header links to Download.
- Add Changelog to header nav and footer (coordinate with the nav card).
- Route is linked from the Download page's "updates" line.

**Acceptance**: builds with rc.1–rc.3 rendered cleanly; a body containing the raw auto-generated list renders as a plain bullet list with no handles or compare URLs.
