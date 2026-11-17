---
title: 'Tools: editing tags'
description: Stage tag edits, review them together, then write them back, with a backup and a verified rollback.
order: 9
section: App
---

Fixing a tag in Oscine changes nothing on disk. Right-click a track, choose **Edit metadata…**, and your correction updates Oscine's own copy, called an override, while the file stays exactly as it was. Edits gather until you decide to write them, and you do that in **Tag write-back**. Open it from the Tools tab, or from the **Tools** menu in the title bar. The small arrow beside the Tools tab opens the same menu.

<!-- shot: tools-writeback -->

## Every field, not just the basics

The editor opens on the fields you'll reach for most: title, artist, album artist, album, track and disc numbers, year, and genre. Open **All fields** below them for just about everything else a file can carry:

- **Credits:** composers, conductor, and remixed by
- **Numbering:** track and disc totals
- **Release:** subtitle, grouping, publisher, copyright, ISRC, and the compilation flag
- **Content:** comment, description, lyrics, BPM, and initial key
- **Sorting:** sort names for the title, artist, album artist, album, and composer
- **Advanced:** MusicBrainz IDs, plus release status, type, and country

Setting an album artist is also how you pull a compilation that's split across several "albums" back into one. The same fields show up in **Track Info**, so you can see everything a file holds without opening the editor.

ReplayGain values are shown too, but you can't type them in by hand. Track Info has a **Source** row that says where each value came from: **from file**, **measured — staged**, or **measured — not in file**. To fill in tracks that have no ReplayGain, Oscine can measure them (Settings → Audio → **Measure ReplayGain**, or **Measure missing ReplayGain** in the palette).

<!-- link: point "measure them" at the ReplayGain article once S-4 (W26-8) lands -->

## Staged, then reviewed

Every unwritten correction collects in Tag write-back. It's a table with one row per track and a column for each field you've changed. Each cell shows the new value on top with the old one struck through underneath. Nothing here has touched your files yet.

You choose what actually gets written. Tick a whole row, or a single field within it. **Select all**, **Clear**, and per-cell checkboxes all work, and the header keeps a running count of tracks and fields selected. **Discard all** throws the pending edits away after asking first. When you're ready, **Write N tracks** writes only what you've ticked.

### Measured ReplayGain in the review

The review's header has **Stage measured ReplayGain**, which sets the gain values Oscine has measured aside for writing to your files. Writing ReplayGain into files is on hold in this release while the Windows side is tested. Staged values are kept, and the review tells you they'll join it once the hold lifts. Playback uses measured gain either way.

<!-- shot-pending: track-info-rg-source (S-10: Track Info with the ReplayGain Source row reading "measured — not in file") -->

<!-- gate: W25. When the ReplayGain write path is unheld: staged gain joins the review and ticked values are written. Add the split-album warning ("This selection splits an album") and the Differs badge (file already has an album gain more than 0.1 dB from the measured one; unticked by default). Update "What never happens on its own" below. -->

## Writing back

Oscine writes each file in the tag format its container actually uses: **ID3v2** for MP3, **Xiph (Vorbis) comments** for FLAC, Ogg (`.ogg`, `.oga`), and Opus, and **iTunes/MP4 atoms** for AAC (`.m4a`, `.mp4`). Several genres are written as one value joined with semicolons, so they read back as the same set. Anything outside those formats, like a `.wav` or a `.wma`, is refused before the file is even opened, so a format Oscine can't round-trip is never put at risk.

Files are written one at a time, with a live count, and you can cancel partway through. Each row ends with a result: **Written**, **Skipped** (the file already held that value), or a specific failure, which is **Unsupported**, **Write failed**, or **Verify failed**. One file failing never stops the rest of the batch, and the summary tallies what was written, skipped, and failed.

## Backup and rollback

No file is edited in place. For each track Oscine copies the original alongside it, applies the tags to the *copy*, and flushes it to disk. Only then does it move the original aside as a backup and swap the new file into its place with an atomic rename, so there's never a half-written file. It re-reads what it just wrote and checks that the tags came back exactly as intended, comparing replaced cover art by its hash. If anything doesn't match, it rolls the backup straight back over the write, leaving the file byte-for-byte what it was before. When the write checks out, the backup is dropped.

## What never happens on its own

Oscine never writes a tag to disk on its own. The only path from an edit to your files is the write you confirm. It never touches the audio, only the tag region, and it never renames or moves your files. It leaves alone everything you didn't change: ReplayGain values already in the file, any custom tags it doesn't know about, and every embedded image except the front cover all come through a write untouched.
