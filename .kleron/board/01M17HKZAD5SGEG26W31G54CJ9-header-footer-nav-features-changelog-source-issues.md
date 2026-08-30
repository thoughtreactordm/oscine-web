---
taskId: 01M17HKZAD5SGEG26W31G54CJ9
title: 'Header, footer, nav: Features + Changelog, Source + Issues, dead-icon cleanup'
status: in-review
priority: medium
labels:
  - design
workstream: W2
workstreamId: W2-3
effort: low
order: 2
created: '2026-08-29T19:58:18.445Z'
updated: '2026-08-30T02:29:45.312Z'
---
Spec: `docs/1.0-site-release.md` §3 (intro paragraph after the route table).

- Header nav: Features, Learn, Download, plus the "Get Oscine" button. Active-state logic in `SiteHeader.vue` already handles prefixes.
- Footer: mark + one-line description (new positioning line), Features, Learn, Download, Changelog, Source (github.com/thoughtreactordm/oscine), Issues. One quiet line: "Open source, MIT." — a fact, not a pitch.
- `astro.config.ts` icon `clientBundle`: remove `i-tabler-wave-sine` (dead since the mark swap); add whatever the new pages need.
- `BaseLayout.astro` default title/description and `package.json` description follow the §1/§2 positioning (drop "for the library you already own" framing as the lead).
- Keep the load-flash fix intact: no new scoped styles in island components (see §6.1).

**Acceptance**: every page shows the new nav/footer; no unused icons in the client bundle; build green.
