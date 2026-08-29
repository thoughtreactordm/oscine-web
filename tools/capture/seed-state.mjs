#!/usr/bin/env node
/**
 * seed-state.mjs — make the throwaway Oscine profile useful in screenshots.
 *
 *   node tools/capture/seed-state.mjs [--capture-root DIR]
 *
 * Run this after Oscine has scanned the generated library. It deliberately
 * rebuilds the authored state in the dedicated capture database so rerunning it
 * produces the same shape instead of accumulating listens and duplicate lists.
 * It seeds:
 *
 * - six weeks of listens, weighted toward six artists, for Stats and Discover;
 * - matching recent play history for the Tunedeck Playing tab;
 * - three old, unplayed hearts for Favorites and Discover's favorite recipes;
 * - two authored playlists and one dated Discover-style snapshot for the rail.
 *
 * Playback, elapsed time, volume, and the two-tier queue are renderer-session
 * state. shoot.mjs establishes those immediately after this durable seed: 2
 * hand-queued rows above 10 rows from the playing scope, at 70% volume.
 *
 * Safety: this script refuses any database whose registered library root is not
 * <capture-root>/library. It never opens the operator's ordinary Oscine profile.
 */

import { access } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { DatabaseSync } from 'node:sqlite'

const DAY_MS = 86_400_000
const LISTEN_ARTISTS = Object.freeze([
  'Ghost Artist',
  'Pennyweight',
  'The Buffers',
  'Skip Rate',
  'Autoplay',
  'Residual Royalty'
])
const FAVORITE_ARTIST = 'Terms of Service'
const PLAYLISTS = Object.freeze([
  { name: 'After the Last Train', limit: 18, offset: 19 },
  { name: 'Files for a Long Walk', limit: 22, offset: 91 }
])

const exists = (path) => access(path).then(() => true, () => false)
const utcDay = (milliseconds) => new Date(milliseconds).toISOString().slice(0, 10)

function requiredTables(db) {
  const wanted = [
    'albums',
    'artists',
    'listen_genres',
    'listens',
    'play_history',
    'playlist_entries',
    'playlists',
    'roots',
    'settings',
    'track_favorites',
    'track_genres',
    'track_overrides',
    'tracks'
  ]
  const rows = db.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (SELECT value FROM json_each(?))"
  ).all(JSON.stringify(wanted))
  const found = new Set(rows.map((row) => row.name))
  const missing = wanted.filter((name) => !found.has(name))
  if (missing.length > 0) {
    throw new Error(`The capture database has not finished migrating (missing: ${missing.join(', ')}).`)
  }
}

function assertCaptureDatabase(db, libraryDir) {
  requiredTables(db)
  const roots = db.prepare('SELECT path FROM roots ORDER BY id').all()
  if (roots.length === 0) {
    throw new Error('The capture database has no library root. Let shoot.mjs scan the generated library first.')
  }
  const expected = resolve(libraryDir)
  const mismatched = roots.filter((row) => resolve(row.path) !== expected)
  if (mismatched.length > 0) {
    throw new Error(
      `Refusing to reseed a database registered to ${mismatched[0].path}; expected only ${expected}.`
    )
  }
}

function tracksForArtistAlbum(db, artistName) {
  const albums = db.prepare(`
    SELECT al.id AS albumId, al.title AS albumTitle, al.year AS year
    FROM albums al
    JOIN artists aa ON aa.id = al.album_artist_id
    WHERE aa.name = ?
    ORDER BY al.year ASC, al.id ASC
  `).all(artistName)
  const album = albums[0]
  if (!album) throw new Error(`Capture library is missing artist: ${artistName}`)
  const tracks = db.prepare(`
    SELECT t.id, t.duration_ms AS durationMs
    FROM tracks t
    WHERE t.album_id = ?
    ORDER BY COALESCE(t.disc_no, 1), COALESCE(t.track_no, 2147483647), t.id
    LIMIT 3
  `).all(album.albumId)
  if (tracks.length < 3) throw new Error(`${artistName} needs at least three tracks in its seed album.`)
  return tracks
}

function favoriteTracks(db) {
  const rows = db.prepare(`
    SELECT picked.id
    FROM albums al
    JOIN artists aa ON aa.id = al.album_artist_id
    JOIN tracks picked ON picked.id = (
      SELECT t.id FROM tracks t
      WHERE t.album_id = al.id
      ORDER BY COALESCE(t.disc_no, 1), COALESCE(t.track_no, 2147483647), t.id
      LIMIT 1
    )
    WHERE aa.name = ?
    ORDER BY al.year ASC, al.id ASC
    LIMIT 3
  `).all(FAVORITE_ARTIST)
  if (rows.length < 3) throw new Error(`${FAVORITE_ARTIST} needs three albums for the favorite seed.`)
  return rows.map((row) => row.id)
}

function playlistTrackIds(db, limit, offset) {
  return db.prepare(`
    SELECT t.id
    FROM tracks t
    LEFT JOIN artists ar ON ar.id = t.artist_id
    LEFT JOIN albums al ON al.id = t.album_id
    ORDER BY ar.name, al.year, al.title, COALESCE(t.disc_no, 1), COALESCE(t.track_no, 2147483647), t.id
    LIMIT ? OFFSET ?
  `).all(limit, offset).map((row) => row.id)
}

function insertPlaylist(db, name, position, trackIds, now) {
  const result = db.prepare(`
    INSERT INTO playlists (name, position, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `).run(name, position, now, now)
  const playlistId = Number(result.lastInsertRowid)
  const insert = db.prepare(
    'INSERT INTO playlist_entries (playlist_id, track_id, position) VALUES (?, ?, ?)'
  )
  trackIds.forEach((trackId, index) => insert.run(playlistId, trackId, index + 1))
  return playlistId
}

function writeGlobalSetting(db, key, value, now) {
  db.prepare("DELETE FROM settings WHERE key = ? AND scope_kind = 'global' AND scope_id IS NULL").run(key)
  db.prepare(`
    INSERT INTO settings (key, scope_kind, scope_id, value, version, updated_at)
    VALUES (?, 'global', NULL, ?, 1, ?)
  `).run(key, JSON.stringify(value), now)
}

/**
 * Rebuild the reproducible authored state in one dedicated capture database.
 */
export async function seedCaptureState(options = {}) {
  const captureRoot = resolve(options.captureRoot ?? join(homedir(), 'oscine-capture'))
  const databaseFile = resolve(
    options.databaseFile ?? join(captureRoot, 'config', 'oscine', 'library.db')
  )
  const libraryDir = resolve(options.libraryDir ?? join(captureRoot, 'library'))
  if (!(await exists(databaseFile))) {
    throw new Error(`No capture database at ${databaseFile}. Run shoot.mjs once to scan the library.`)
  }

  const db = new DatabaseSync(databaseFile)
  db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 10000;')
  try {
    assertCaptureDatabase(db, libraryDir)
    const now = options.now ?? Date.now()
    const captureDay = utcDay(now)
    // Four slots end five minutes before the current rounded hour. No seeded
    // listen can land in the future, regardless of what time the script runs.
    const latestListen = Math.floor(now / 3_600_000) * 3_600_000 - 5 * 60_000
    const dayAnchor = latestListen - 6 * 3_600_000 - (LISTEN_ARTISTS.length - 1) * 1_000
    const artistTracks = LISTEN_ARTISTS.map((name) => ({ name, tracks: tracksForArtistAlbum(db, name) }))
    const hearts = favoriteTracks(db)

    const insertListen = db.prepare(`
      INSERT INTO listens
        (track_id, started_at, ms_listened, duration_ms, title, artist_name, album_title, album_artist_name)
      SELECT t.id, ?, ?, t.duration_ms, t.title, ar.name, al.title, aa.name
      FROM tracks t
      LEFT JOIN artists ar ON ar.id = t.artist_id
      LEFT JOIN albums al ON al.id = t.album_id
      LEFT JOIN artists aa ON aa.id = al.album_artist_id
      WHERE t.id = ? AND t.title IS NOT NULL
    `)
    const copyGenres = db.prepare(`
      INSERT INTO listen_genres (listen_id, genre_key, genre)
      SELECT ?, genre_key, genre FROM track_genres WHERE track_id = ?
    `)
    const recentHistory = []

    db.exec('BEGIN IMMEDIATE')
    try {
      db.exec(`
        DELETE FROM listen_genres;
        DELETE FROM listens;
        DELETE FROM play_history;
        DELETE FROM track_favorites;
        DELETE FROM playlist_entries;
        DELETE FROM playlists;
        UPDATE tracks SET play_count = 0, last_played_at = NULL;
      `)

      // Four listens on each of 43 days. The artist index advances at different
      // rates from the track index, producing a visible but stable top six.
      for (let day = 42; day >= 0; day -= 1) {
        for (let slot = 0; slot < 4; slot += 1) {
          const sequence = (42 - day) * 4 + slot
          const artistIndex = (sequence * 5 + Math.floor(sequence / 9)) % artistTracks.length
          const artist = artistTracks[artistIndex]
          const track = artist.tracks[(sequence + artistIndex) % artist.tracks.length]
          const startedAt = dayAnchor - day * DAY_MS + slot * 2 * 3_600_000 + artistIndex * 1_000
          const msListened = Math.max(20_000, track.durationMs ?? 30_000)
          const result = insertListen.run(startedAt, msListened, track.id)
          if (result.changes !== 1) throw new Error(`Could not seed listen for track ${track.id}.`)
          const listenId = Number(result.lastInsertRowid)
          copyGenres.run(listenId, track.id)
          recentHistory.push({ trackId: track.id, playedAt: startedAt })
        }
      }

      db.exec(`
        UPDATE tracks AS t
        SET play_count = (SELECT COUNT(*) FROM listens l WHERE l.track_id = t.id),
            last_played_at = (SELECT MAX(l.started_at) FROM listens l WHERE l.track_id = t.id)
      `)

      const insertHistory = db.prepare('INSERT INTO play_history (track_id, played_at) VALUES (?, ?)')
      for (const row of recentHistory.slice(-48)) insertHistory.run(row.trackId, row.playedAt)

      const insertFavorite = db.prepare(
        'INSERT INTO track_favorites (track_id, favorited_at) VALUES (?, ?)'
      )
      hearts.forEach((trackId, index) => insertFavorite.run(trackId, dayAnchor - (8 - index) * DAY_MS))

      PLAYLISTS.forEach((playlist, position) => {
        insertPlaylist(
          db,
          playlist.name,
          position,
          playlistTrackIds(db, playlist.limit, playlist.offset),
          dayAnchor - (position + 3) * DAY_MS
        )
      })
      const discoverTracks = db.prepare(`
        SELECT t.id
        FROM tracks t
        JOIN albums al ON al.id = t.album_id
        JOIN artists aa ON aa.id = al.album_artist_id
        WHERE aa.name IN (SELECT value FROM json_each(?))
          AND t.play_count = 0
        ORDER BY aa.name, al.year DESC, al.id, COALESCE(t.track_no, 2147483647), t.id
        LIMIT 24
      `).all(JSON.stringify(LISTEN_ARTISTS)).map((row) => row.id)
      insertPlaylist(
        db,
        `Built for you · ${captureDay}`,
        PLAYLISTS.length,
        discoverTracks,
        dayAnchor
      )

      writeGlobalSetting(db, 'interface.onboardingCompleted', true, dayAnchor)
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }

    const summary = {
      databaseFile,
      captureLeadTrackId: Number(db.prepare(`
        SELECT t.id
        FROM tracks t
        JOIN albums al ON al.id = t.album_id
        JOIN artists aa ON aa.id = al.album_artist_id
        WHERE aa.name = 'Residual Royalty'
          AND al.title = 'Owned Until Revoked'
          AND t.title = 'Now Playing (For Now)'
      `).get().id),
      listens: Number(db.prepare('SELECT COUNT(*) AS n FROM listens').get().n),
      history: Number(db.prepare('SELECT COUNT(*) AS n FROM play_history').get().n),
      favorites: Number(db.prepare('SELECT COUNT(*) AS n FROM track_favorites').get().n),
      playlists: Number(db.prepare('SELECT COUNT(*) AS n FROM playlists').get().n),
      playlistEntries: Number(db.prepare('SELECT COUNT(*) AS n FROM playlist_entries').get().n),
      firstListen: Number(db.prepare('SELECT MIN(started_at) AS at FROM listens').get().at),
      lastListen: Number(db.prepare('SELECT MAX(started_at) AS at FROM listens').get().at)
    }
    return summary
  } finally {
    db.close()
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      'capture-root': { type: 'string' },
      help: { type: 'boolean', short: 'h', default: false },
      json: { type: 'boolean', default: false }
    }
  })
  if (values.help) {
    console.log('Usage: node tools/capture/seed-state.mjs [--capture-root DIR] [--json]')
    return
  }
  const summary = await seedCaptureState({ captureRoot: values['capture-root'] })
  if (values.json) console.log(JSON.stringify(summary, null, 2))
  else {
    const spanDays = Math.round((summary.lastListen - summary.firstListen) / DAY_MS)
    console.log(
      `Seeded ${summary.listens} listens across ${spanDays} days, ${summary.history} history rows, ` +
      `${summary.favorites} favorites, and ${summary.playlists} playlists ` +
      `(${summary.playlistEntries} entries).`
    )
  }
}

if (resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    console.error(error.stack ?? error.message)
    process.exitCode = 1
  })
}
