/**
 * Marketing fixture — fictional artists, Unsplash abstracts as covers.
 *
 * Do not put real discographies or cover scans here. The joke is the
 * streaming-rental economy, not a specific service or musician. Names are
 * invented; they must not be trademarks (Spotify, Apple Music, …) or
 * lookalike band names.
 *
 * Covers live in /public/mock-library; credits in CREDITS.txt there.
 */

export interface MockAlbum {
  title: string
  artist: string
  cover: string
}

export interface MockNowPlaying {
  title: string
  artist: string
  album: string
  cover: string
}

export const mockAlbums: MockAlbum[] = [
  {
    title: 'Owned Until Revoked',
    artist: 'Residual Royalty',
    cover: '/mock-library/owned-until-revoked.jpg'
  },
  {
    title: 'A Catalogue of Absences',
    artist: 'The Region Locks',
    cover: '/mock-library/catalogue-of-absences.jpg'
  },
  {
    title: 'Premium Silence',
    artist: 'Pennyweight',
    cover: '/mock-library/premium-silence.jpg'
  },
  {
    title: 'Shuffle Never Ends',
    artist: 'Soft Paywall',
    cover: '/mock-library/shuffle-never-ends.jpg'
  },
  {
    title: 'The Long Tail',
    artist: 'Ad Break',
    cover: '/mock-library/the-long-tail.jpg'
  },
  {
    title: 'Files We Used To Have',
    artist: 'Residual Royalty',
    cover: '/mock-library/files-we-used-to-have.jpg'
  }
]

export const mockArtists: string[] = [...new Set(mockAlbums.map((album) => album.artist))]

export const mockNowPlaying: MockNowPlaying = {
  title: 'Now Playing (For Now)',
  artist: 'Residual Royalty',
  album: 'Owned Until Revoked',
  cover: '/mock-library/owned-until-revoked.jpg'
}

export function albumCountFor(artist: string): number {
  return mockAlbums.filter((album) => album.artist === artist).length
}
