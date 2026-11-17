---
title: Stats
description: What you actually listened to, over the range you pick, and what scrobbling sends.
order: 7
section: App
---

Stats is your listening dashboard. Pick a range (the last 7, 30, or 90 days, this year, or all time; 30 days is where it starts) and you'll see headline totals, a **Listening over time** chart, and your top artists, albums, tracks, and genres. Rank them **By plays** or **By time**.

<!-- shot: stats -->

A play counts once you've heard half the track or four minutes of it, whichever comes first. Tracks of 30 seconds or less don't count. Time spent paused doesn't count, and neither does any stretch you skip past by seeking more than two seconds. Totals follow the tags as they were when you listened, so a later rename doesn't rewrite last year.

The log is local. It's not a Wrapped-style retrospective, just a dashboard you can keep open.

## Favorites

Favorites (the heart on a song) are local, and Last.fm loved tracks are never pulled in. If you connect Last.fm, hearting a song sends a love the other way, and un-hearting it takes the love back. That's on by default as **Love favorited tracks on Last.fm**, and you can turn it off. Songs you hearted before connecting aren't sent.

## Scrobbling

Connect **Last.fm**, **ListenBrainz**, or both, in Settings → Network. A play that crosses the same threshold the dashboard counts is sent with the artist, title, album, and when you listened. Last.fm also gets the album artist when it's different from the track artist. While a track is on, Oscine also announces it as "now playing", which is what the service shows as playing.

Each service has its own queue. If you're connected but offline, your plays wait and go out once the service is reachable again. Plays you make while a service is disconnected aren't saved for it, and a play the service turns down is dropped. Loves are Last.fm only. ListenBrainz has no loved-track concept for Oscine to push to.

Last.fm signs you in through your browser once, and ListenBrainz takes a user token you paste from your account. Either can be paused on its own, which holds its queue rather than discarding it.

## Discord

Oscine can show what you're listening to on your Discord profile. Turn on **Show what you're playing on Discord** in Settings → Network, with the Discord app running on the same computer.

**Detail to broadcast** controls how much people see: the title and artist, just the title, or simply "Listening to music". **Status line template** lets you word the status yourself with `{title}`, `{artist}`, `{album}`, and `{albumArtist}`, up to 128 characters. The template doesn't apply when you broadcast only "Listening to music". **Show a progress bar** adds the track's progress, and **While paused** chooses between **Hide presence** and **Show "Paused"**.

Turn on **Show album art** to show the release's cover, looked up on MusicBrainz and the Cover Art Archive. It's off by default and needs online lookups turned on. The art always comes from there, never from the files on your computer.
