---
title: Keyboard & shortcuts
description: The command palette and its prefixes, playback and navigation keys, media keys, and what a double-click does.
order: 12
section: App
---

Oscine ships a fixed set of shortcuts, and they can't be rebound yet. You'll find the list in the app under **Help → Keyboard shortcuts**, and everything is here too. On a Mac keyboard, read **Ctrl** as **⌘** throughout. The app accepts both.

Every shortcut, **Ctrl+K** included, stands down while you're typing in a text field, so typing a space or an arrow in a search box never touches playback.

## The command palette

**Ctrl+K** opens the palette over the whole app. Type freely, or lead with a prefix to narrow it to one kind of thing:

| Prefix | Searches |
|---|---|
| `>` | Actions |
| `@` | Artists |
| `#` | Playlists |
| `/` | Settings |

Under `>` you'll find playback actions like **Play / Pause**, **Shuffle all songs**, **Clear queue**, and **Toggle Zen mode**. There are also commands for the tools (**Open Tag write-back**, **Open Rip CD**, **Open Equalizer**, **Turn equalizer on/off**, and **Equalizer:** followed by each saved preset) and for the Stage visualizer (**Toggle visualizer**, **Next visualizer**, **Previous visualizer**, and **Visualizer:** followed by an effect name), plus **Measure missing ReplayGain** and **Run first-run setup again**.

**Ctrl+F** jumps straight into the palette's search, and **Esc** closes it. See [Quick access](/learn/quick-access) for what the palette reaches and the Quick Menu beside it.

## Playback

| Key | Action |
|---|---|
| **Space** | Play / pause |
| **Ctrl+←** / **Ctrl+→** | Previous / next track |
| **Shift+←** / **Shift+→** | Seek back / forward 5 seconds |
| **Ctrl+↑** / **Ctrl+↓** | Volume up / down 5% |

Space also stands down when a button or link has focus, so pressing it activates the thing you tabbed to instead of pausing the music.

## Navigation

| Key | Action |
|---|---|
| **Ctrl+1**–**Ctrl+7** | Jump to a tab by its position, from Library through Settings |
| **Ctrl+K** | Open or close the command palette |
| **Ctrl+F** | Focus search |
| **Esc** | Close the palette |
| **F11** or **Ctrl+Shift+Z** | Toggle Zen mode |

Zen mode is fullscreen with the title bar, tabs, and player bar hidden. The Stage keeps its play controls, which fade when the pointer leaves the window and come back when it returns. The same key toggles Zen off, and leaving fullscreen any other way drops out of it too.

In the song list, **Esc** clears the selection.

## Visualizer

On Now Playing:

| Key | Action |
|---|---|
| **Ctrl+Shift+V** | Show or hide the visualizer |
| **Ctrl+Shift+←** / **Ctrl+Shift+→** | Previous / next effect, while the visualizer is showing |

<!-- shot-pending: stage-visualizer (S-10: Linux + discrete GPU only until W23-15 passes) -->

## Media keys

Your keyboard's **media keys** control Oscine through the operating system, so they work even when the window isn't focused or is behind another app. Play, pause, next, previous, and stop all work, and seeking from the OS controls moves 10 seconds by default. Oscine shows up in the OS now-playing controls the same way: the Windows media card and the Linux (MPRIS) media widget both drive it.

## Double-click

What a double-click does to a song is up to you: play it now, play it next, add it to the queue, or add it to the open playlist. **Enter** on the focused row does the same thing. A separate setting covers double-clicking an artist or album, so a whole record can behave differently from a single track. Choose both in Interface settings.
