---
taskId: 01M17HP57CQMF2ZBT1HEJVHCP1
title: 'Vercel: GITHUB_TOKEN env, deploy hook from the app''s release workflow'
status: todo
priority: medium
labels:
  - deploy
  - needs-michael
workstream: W4
workstreamId: W4-3
effort: low
order: 17
created: '2026-08-29T19:59:30.028Z'
updated: '2026-08-29T19:59:30.028Z'
---
Spec: `docs/1.0-site-release.md` §7 checklist. Vercel already deploys `main` to www.oscine.app (confirmed 2026-08-29); remaining items:

1. Vercel env `GITHUB_TOKEN` (fine-grained, read-only, public repos) so Download/Changelog builds don't hit the 60/hr unauthenticated limit from shared egress IPs. **Michael** creates the token and sets it.
2. Vercel Deploy Hook for `main`; **Michael** creates it and stores the URL as `VERCEL_DEPLOY_HOOK` secret in `thoughtreactordm/oscine`.
3. In the app repo: a small `on: release: published` workflow (or a final step in `release-build`) that `curl -X POST "$VERCEL_DEPLOY_HOOK"` so the site rebuilds when a release lands. Agent can open that PR once the secret exists.
4. Keep PR preview deployments on — that's how copy gets reviewed.

**Acceptance**: publishing a test pre-release triggers a site deploy; Download shows the new version without a manual redeploy.
