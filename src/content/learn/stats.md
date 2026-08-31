---
title: Stats
description: What you actually listened to, for any range you ask, and what scrobbling sends.
order: 7
section: App
---

Stats is the listening dashboard: top artists, albums, tracks, and time spent, scoped to a range.

<!-- shot: stats -->

A play counts once you have heard half the track or four minutes of it, whichever comes first. Paused and seeked-over time does not count. Totals follow the tags as they were when you listened, so a later rename does not rewrite last year.

The log is local. It is meant to survive a folder reorganize. It is not a Wrapped-style retrospective; it is a dashboard you can keep open.

## Favorites

Favorites (the heart on a song) are local. Last.fm loved tracks are never pulled in. If you connect Last.fm, hearting a song can push a love the other way. That is an optional one-way push, not a background sync.

## Scrobbling

Connect **Last.fm**, **ListenBrainz**, or both, in Settings → Network. A play that crosses the same threshold the dashboard counts is queued and sent: the artist, title, album, album artist, and when you listened. Oscine also announces the current track as "now playing" while it is on, which is what the service shows as playing.

The queue is per service, so a target that is offline or signed out holds its plays and sends them when it can — nothing is dropped. Loves are Last.fm only; ListenBrainz has no loved-track concept for Oscine to push to, so hearts go nowhere there.

Last.fm signs you in through your browser once; ListenBrainz takes a user token you paste from your account. Either can be paused on its own, which freezes its queue rather than discarding it.
