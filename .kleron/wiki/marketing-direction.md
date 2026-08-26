---
title: Oscine website — marketing direction
created: '2026-08-26T14:17:27.934Z'
updated: '2026-08-26T14:17:27.934Z'
---
# Oscine website — marketing direction

Locked 2026-08-26 from the first briefing. Override here if the brief changes; do not quietly drift in page copy.

## Audience

**Primary: local-player refugees.** Music nerds who already live in foobar2000, fooyin, MusicBee, Strawberry, or a folder of files and a player that looks like 2008. The homepage talks to them first: power-user control, a modern interface, features they have been missing (Tunedeck, themes they can actually author, Discover they can explain).

**Secondary beat: streaming's cost.** Not the hero contrast. Still say it: catalogues vanish, artists see pennies, you do not own the library you spent a decade building. Oscine plays the files you already paid for.

## Voice

**Classic product marketing.** Benefit-led, confident, a little warm. Not the design-doc register.

Do **not**:

- Lead with bit-perfect / Web Audio caveats. If someone cares, they already know how to set a device sample rate.
- Quote a track-count target ("100k"). Say it handles whatever library they throw at it.
- Pre-defend. No "early development", no "beta testing program", no hobby-project apology. It is new; that is enough of a disclaimer. It is also a robust application.
- Use the in-app fatalism ("cannot", "never", "accepted cost") as marketing copy.

Do:

- Sell ownership, taste, and control.
- Name distinctive surfaces: Tunedeck, Quick Menu, command palette, token editor, Discover recipes, Stats.
- Keep Learn/docs clearer and more instructional than the homepage, still without pedantry.

## Launch

**Public downloads on day one.** Windows NSIS, Linux AppImage and `.deb`. Point at GitHub Releases (`thoughtreactordm/oscine`) rather than hosting binaries in this repo.

Version reality: 0.8.x, approaching a 1.0 release candidate. The site can say it is new. It should not say it is unfinished hobbyware.

Platforms: Windows and Linux. No macOS. State that as a fact, not an apology.

## Site shape

**Marketing-first.**

| Route | Job |
|---|---|
| `/` | Sell. Hero, contrasts, feature reel, download CTA. |
| `/download` | Get the app. |
| `/learn` | Secondary. Getting started, then feature pages (Library, Curate, Tunedeck, Themes, Podcasts, Stats, shortcuts). Target for the in-app Help → documentation link. |

Learn is real documentation, not a blog. It is not equal weight with the homepage.

## Stack

Astro + Vue islands + Nuxt UI (same Vue/Nuxt UI family as the app). Docs as Astro content collections. Interactive bits (theme preview, palette walkthrough) are Vue islands. `ui({ router: false })` because Astro owns routing.

Visual: Oscine amber on taupe, Sora wordmark, Tabler `wave-sine` mark, dark-first.

## Positioning one-liner (working)

Oscine is a local music player for people who already own their library — the control of a power-user app, the interface of a modern one.
