---
title: Library
description: Folders, browsing, columns, grouping, and how Oscine treats your files.
order: 2
section: App
---

The Library tab is the collection: a sidebar with **Genres & tags**, **Artists**, **Albums**, and a folder picker, and a song list that stays fast no matter how much you throw at it.

<!-- shot: library-hero -->

## Folders on disk

Oscine doesn't copy your files into a private store. It indexes the folders you add, and you can add, remove, or rescan them from the **Library** menu in the title bar.

Edits you make in Oscine, like tag corrections and favorites, live in Oscine. They don't rewrite the files on disk unless you ask. [Editing tags](/learn/tools) covers the review step that does.

## Browsing

Filter by genre or tag, artist, album, or folder from the sidebar. Search finds what you type in the title, artist, or album, even partway through a word. Words shorter than three characters are skipped, and the box tells you when nothing you've typed is long enough yet. When you know the name, the command palette is the faster jump.

## Columns, grouping, and density

The song list is a table you arrange. The column chooser turns columns on and off: title, artist, album, time, year, format, sample rate, bit depth, size, plays, last played, tags, and more. Click a header to sort by #, title, artist, album, **year**, time, plays, or last played. The year column is hidden until you turn it on, and sorting by it puts a discography in release order. Shift and Ctrl select the way a desktop list should.

<!-- shot-pending: library-year-sort (S-10: song list sorted by the Year column) -->

Turn on **Group tracks by album** for a cover-art header over each record while the list is sorted by album. **Album header artwork** sets the size of that art, with three to choose from. Row density is compact, default, or roomy, and compact fits about a third more rows on a screen. Grouping and art size sit in the toolbar, and density is an Interface setting.

What a double-click does (play now, play next, queue, or add to the open playlist) is up to you.

## Loudness and format

Oscine plays MP3, FLAC, Ogg Vorbis, Opus, AAC (`.m4a`), and WAV. Crossfade is a duration, and zero is gapless.

ReplayGain is applied from the values your files carry. For tracks without any, Oscine can measure them: after a scan it tells you how many tracks have no ReplayGain and offers to **Measure** them, and you can also start it from **Measure ReplayGain** in Settings → Audio, from the palette's **Measure missing ReplayGain**, or by right-clicking tracks and choosing **Measure ReplayGain**. It runs in the background and saves the results in Oscine's library. Your files aren't changed.

<!-- link: point at the ReplayGain article once S-4 (W26-8) lands -->
