---
title: Getting started
description: Install Oscine, run the first-time setup, add your music, and start listening.
order: 1
section: Start
---

Oscine is a local music player. It indexes folders on your disk and plays those files. There is no account and no streaming catalog.

## Install

Download the [Windows installer](/download), the Linux AppImage, or the `.deb`. Launch Oscine.

## First run

The first time you open Oscine, a short wizard walks you through setup:

- **Add your music**: point Oscine at a folder on this computer. This is the one step it waits for, and you can add more folders later.
- **How it looks**: light, dark, or match the system, and which built-in theme. Changes apply as you make them.
- **Sound**: where audio is sent, and **Volume levelling**, which evens out loudness with ReplayGain. Pick off, per track (the default), or per album. It uses gain values your files already carry. Oscine can also measure tracks that don't have any, which is covered further down.
- **Online & sharing**: off by default, and fine to leave off. Turned on, Oscine can fetch artist info and album art and browse the podcast catalog. The same step has a separate switch for showing what you're playing on Discord, which is also off until you turn it on.
- **Ready**: indexing runs in the background, so you can finish whenever you like and start listening while it works.

<!-- shot: onboarding -->

Nothing here is permanent. You can change any of it later in Settings. To go through the whole wizard again, click **Run setup again** at the top of Settings → Library, or run **Run first-run setup again** from the command palette.

## Add a library folder

To add more music later, use **Library → Add music folder…** in the title bar menu, or **Add folder…** in the Library sidebar. Oscine scans the folder, reads tags, and builds artwork thumbnails. You can add as many folders as you like.

A watcher keeps the library in step when you add or remove files outside the app. You can turn that off in Settings if you'd rather rescan by hand. The same Library menu rescans one folder or all of them whenever you want.

## Find something and play it

The Library sidebar has **Genres & tags**, **Artists**, and **Albums**, plus a folder picker, and the song list fills the rest of the window. Double-click a song to play it (you can change what a double-click does). Double-click an artist or album to play all of it.

Hover the seek bar to see the time at that point before you click.

**Ctrl+K** opens the command palette from anywhere: views, albums, artists, playlists, tracks, subscribed shows, actions, and settings.

## The Stage and Zen mode

**Now Playing** is the Stage: one record, artwork as large as the window allows, and no sidebar to browse. It's where you land when you want to sit with what's playing. When a track has lyrics, they show up beside the artwork, and synced lyrics scroll along with the song. Oscine reads them from a `.lrc` file next to the track or from the file's own tags.

**Zen mode** goes further. Press **F11** or **Ctrl+Shift+Z** and Oscine goes fullscreen. The title bar, the tabs, and the player bar go away, and the Stage keeps its own play controls. Those fade out when you move the pointer off the window and come back as soon as it returns, so a screen across the room shows only the music. Press the same key again to leave, and leaving fullscreen any other way ends Zen too.

## Optional, later

- **Online lookups** (Settings → Network) fetch artist biographies and relations for the Tunedeck, find lyrics on LRCLIB for the track that's playing, match CDs on MusicBrainz and fetch their covers when you rip, and let Podcast Discover browse Apple's catalog. They're off by default.
- **Last.fm and ListenBrainz**: scrobble to either or both. Last.fm signs you in through your browser, and ListenBrainz takes a user token you paste from your account. See [Stats](/learn/stats) for what gets sent.
- **Podcasts**, if you want shows next to the library. Episodes download, then play, and they stay out of your music list.
- **Noctalia** on Linux: if your desktop uses Noctalia, Oscine can take its colors from there. See [Themes](/learn/themes).

## ReplayGain

Volume levelling works from the ReplayGain values stored in your files. If some tracks don't have any, Oscine tells you after a scan and offers to **Measure** them. You can also start it from **Measure ReplayGain** in Settings → Audio. Measuring runs in the background and saves the results in Oscine's library, so your files stay as they are.

<!-- link: point "Measure" at the ReplayGain article once S-4 (W26-8) lands -->

## Updating

Open **Settings → About** and click **Check for updates**. With the Windows installer or the AppImage, Oscine shows **Download update** when a new version is out, then **Restart to install** once it has it. The update goes in when you click that, not when you quit. The `.deb` can check too, but it can't replace itself: it points you to the new release, and you install that package the same way you installed the first one. Oscine only checks when you ask.

Updating from inside the app works from Oscine 1.1.3 on. If you're on an earlier version, install the latest build from the [download page](/download) once, and updates work from Settings after that.

More in [Library](/learn/library), [Tunedeck](/learn/tunedeck), and [Themes](/learn/themes).
