<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { Release } from '../data/release'
import { SHOT_ALTS } from '../data/learn-shots'
import DownloadButtons from './DownloadButtons.vue'
import TourShot, { type TourShotAsset } from './TourShot.vue'

defineProps<{
  release: Release
  shots: {
    libraryHero: TourShotAsset
    columnChooser: TourShotAsset
    tunedeckArtist: TourShotAsset
    tunedeckRelated: TourShotAsset
    themeOscineDark: TourShotAsset
    themeOscineLight: TourShotAsset
    themeNocturne: TourShotAsset
    themeEditor: TourShotAsset
    curateDiscover: TourShotAsset
    stage: TourShotAsset
    zen: TourShotAsset
    trackInfo: TourShotAsset
    stats: TourShotAsset
    podcasts: TourShotAsset
    toolsWriteback: TourShotAsset
    palette: TourShotAsset
    quickMenu: TourShotAsset
  }
}>()

const alignStart = {
  title: 'text-left',
  description: 'text-left',
  headline: 'justify-start',
  leading: 'justify-start',
  links: 'justify-start'
}

const heroLinks: ButtonProps[] = [
  { label: 'Download', to: '/download' },
  {
    label: 'Learn',
    to: '/learn',
    color: 'neutral',
    variant: 'subtle'
  }
]

const half = '(min-width: 1024px) 36rem, 100vw'
const trio = '(min-width: 640px) 22rem, 100vw'
const full = '(min-width: 80rem) 72rem, 100vw'
</script>

<template>
  <UContainer>
    <UPageHeader
      headline="Features"
      title="Every surface."
      description="A screenshot tour of Oscine. Each section is one screen and the facts that belong to it."
      :links="heroLinks"
    />
  </UContainer>

  <UPageSection
    title="Library"
    orientation="horizontal"
    class="border-t border-default"
    :ui="alignStart"
  >
    <template #description>
      <p>
        Point Oscine at folders you already have. It indexes those paths; the files stay where you
        put them. Browse by artist, album, or song. Search is instant over title, artist, and album.
      </p>
      <p class="mt-4">
        The song list is built for 100k tracks. Group by album, pick a density, and choose which
        columns you want.
      </p>
    </template>

    <div class="flex min-w-0 flex-col gap-3">
      <TourShot
        :shot="shots.libraryHero"
        :alt="SHOT_ALTS['library-hero']"
        :sizes="half"
        loading="eager"
      />
      <TourShot
        :shot="shots.columnChooser"
        :alt="SHOT_ALTS['column-chooser']"
        :sizes="half"
        variant="natural"
      />
    </div>
  </UPageSection>

  <UPageSection
    title="Tunedeck"
    orientation="horizontal"
    reverse
    class="border-t border-default bg-elevated/40"
    :ui="alignStart"
  >
    <template #description>
      <p>
        A drawer on the right that stays open while you browse. Four tabs: Artist, Track, Related,
        and Playing. Related is the rest of the album, then looser matches on genre, year, or
        folder, all from your library.
      </p>
      <p class="mt-4">
        Turn on online lookups and it adds a biography and line-ups; leave them off and everything
        local still works.
      </p>
    </template>

    <div class="flex min-w-0 flex-col gap-3">
      <TourShot
        :shot="shots.tunedeckArtist"
        :alt="SHOT_ALTS['tunedeck-artist']"
        :sizes="half"
      />
      <TourShot
        :shot="shots.tunedeckRelated"
        :alt="SHOT_ALTS['tunedeck-related']"
        :sizes="half"
      />
    </div>
  </UPageSection>

  <UPageSection
    title="Themes"
    class="border-t border-default"
    :ui="{ ...alignStart, body: 'mt-8' }"
  >
    <template #description>
      <p>
        Three themes, each in light and dark: Oscine, Nocturne, and High Contrast. The token editor
        covers color, type, and motion, and a contrast warning sits on the row that caused it.
      </p>
      <p class="mt-4">The accent can follow the current cover. An accent you set in the editor still wins.</p>
    </template>

    <template #body>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <figure class="min-w-0">
          <TourShot
            :shot="shots.themeOscineDark"
            :alt="SHOT_ALTS['theme-oscine-dark']"
            :sizes="trio"
          />
          <figcaption class="mt-2 text-sm text-muted">Oscine dark</figcaption>
        </figure>
        <figure class="min-w-0">
          <TourShot
            :shot="shots.themeOscineLight"
            :alt="SHOT_ALTS['theme-oscine-light']"
            :sizes="trio"
          />
          <figcaption class="mt-2 text-sm text-muted">Oscine light</figcaption>
        </figure>
        <figure class="min-w-0">
          <TourShot
            :shot="shots.themeNocturne"
            :alt="SHOT_ALTS['theme-nocturne']"
            :sizes="trio"
          />
          <figcaption class="mt-2 text-sm text-muted">Nocturne</figcaption>
        </figure>
      </div>
      <div class="mt-6">
        <TourShot
          :shot="shots.themeEditor"
          :alt="SHOT_ALTS['theme-editor']"
          :sizes="full"
        />
      </div>
    </template>
  </UPageSection>

  <UPageSection
    title="Curate & Discover"
    orientation="horizontal"
    class="border-t border-default bg-elevated/40"
    :ui="alignStart"
  >
    <template #description>
      <p>
        Playlists live on a rail, with My Favorites at the top. Export to .m3u8 when you need the
        list somewhere else. The queue is two layers: tracks you queued by hand sit above the rest
        of the session. Shuffle reorders the session and leaves those hand-queued tracks alone.
      </p>
      <p class="mt-4">
        Discover is nine recipes over your files and your listening log. Sitting unplayed, Forgotten
        favorites, and Almost finished are three of them. Every card has a one-line reason, and a
        shelf becomes a playlist when you save it.
      </p>
    </template>

    <TourShot
      :shot="shots.curateDiscover"
      :alt="SHOT_ALTS['curate-discover']"
      :sizes="half"
    />
  </UPageSection>

  <UPageSection
    title="Stage & Zen"
    orientation="horizontal"
    reverse
    class="border-t border-default"
    :ui="alignStart"
  >
    <template #description>
      <p>
        The Stage is Now Playing at full window: the cover, a waveform ribbon, and the track you are
        hearing.
      </p>
      <p class="mt-4">
        Zen drops the title bar, the tabs, and the transport chrome and goes fullscreen. It is for a
        TV or a second screen.
      </p>
    </template>

    <div class="flex min-w-0 flex-col gap-3">
      <TourShot
        :shot="shots.stage"
        :alt="SHOT_ALTS.stage"
        :sizes="half"
      />
      <TourShot
        :shot="shots.zen"
        :alt="SHOT_ALTS.zen"
        :sizes="half"
      />
    </div>
  </UPageSection>

  <UPageSection
    title="Playback"
    orientation="horizontal"
    class="border-t border-default bg-elevated/40"
    :ui="alignStart"
  >
    <template #description>
      <p>
        Gapless is the default. A crossfade duration of zero is gapless; raise it and you get a fade
        at the boundary.
      </p>
      <p class="mt-4">
        ReplayGain comes from tags when they exist. Untagged tracks can be measured in the
        background. Oscine plays FLAC, MP3, Ogg Vorbis, Opus, AAC, and WAV.
      </p>
    </template>

    <TourShot
      :shot="shots.trackInfo"
      :alt="SHOT_ALTS['track-info']"
      :sizes="half"
      variant="natural"
    />
  </UPageSection>

  <UPageSection
    title="Stats"
    orientation="horizontal"
    reverse
    class="border-t border-default"
    :ui="alignStart"
  >
    <template #description>
      <p>
        Stats is the listening log: top artists, albums, and tracks for a range you pick. Totals
        follow the tags as they were when you listened, so a later rename or a folder reorganize
        does not rewrite last year. Favorites are local.
      </p>
    </template>

    <TourShot
      :shot="shots.stats"
      :alt="SHOT_ALTS.stats"
      :sizes="half"
    />
  </UPageSection>

  <UPageSection
    title="Podcasts"
    orientation="horizontal"
    class="border-t border-default bg-elevated/40"
    :ui="alignStart"
  >
    <template #description>
      <p>
        Subscribe, download, then play. Shows stay on their own tab. Episodes are not mixed into the
        music library, search, or ReplayGain.
      </p>
    </template>

    <TourShot
      :shot="shots.podcasts"
      :alt="SHOT_ALTS.podcasts"
      :sizes="half"
    />
  </UPageSection>

  <UPageSection
    title="Tools"
    orientation="horizontal"
    reverse
    class="border-t border-default"
    :ui="alignStart"
  >
    <template #description>
      <p>
        Tag edits are staged. You review the before and after, then write. A backup of the original
        sits beside the file until the write stands.
      </p>
    </template>

    <TourShot
      :shot="shots.toolsWriteback"
      :alt="SHOT_ALTS['tools-writeback']"
      :sizes="half"
    />
  </UPageSection>

  <UPageSection
    title="Quick access"
    orientation="horizontal"
    class="border-t border-default bg-elevated/40"
    :ui="alignStart"
  >
    <template #description>
      <p>
        <UKbd>Ctrl</UKbd>
        <UKbd class="ml-1">K</UKbd>
        opens the command palette from anywhere. Prefixes narrow it:
        <code class="text-highlighted">&gt;</code> for actions,
        <code class="text-highlighted">@</code> for artists,
        <code class="text-highlighted">#</code> for playlists,
        <code class="text-highlighted">/</code> for settings.
      </p>
      <p class="mt-4">
        The Quick Menu on Now Playing holds favorite playlists, recent additions, and favorite
        artists. Playback and navigation have a fixed set of global shortcuts.
      </p>
    </template>

    <div class="flex min-w-0 flex-col gap-3">
      <TourShot
        :shot="shots.palette"
        :alt="SHOT_ALTS.palette"
        :sizes="half"
      />
      <TourShot
        :shot="shots.quickMenu"
        :alt="SHOT_ALTS['quick-menu']"
        :sizes="half"
      />
    </div>
  </UPageSection>

  <UPageSection title="Scrobbling" class="border-t border-default" :ui="alignStart">
    <template #description>
      <div class="flex flex-wrap items-center gap-8 text-highlighted">
        <span class="inline-flex items-center gap-2.5">
          <UIcon name="i-tabler-brand-lastfm" class="size-8" />
          Last.fm
        </span>
        <span class="inline-flex items-center gap-2.5">
          <UIcon name="i-tabler-brain" class="size-8" />
          ListenBrainz
        </span>
      </div>
      <p class="mt-4">An outbox holds listens while you are offline, then sends them in order.</p>
    </template>
  </UPageSection>

  <UPageCTA
    variant="naked"
    class="rounded-none border-t border-default"
    title="Get Oscine."
    description="Free for Windows and Linux."
    :ui="alignStart"
  >
    <template #body>
      <DownloadButtons :release="release" />
    </template>
    <template #footer>
      <p class="text-sm text-dimmed">
        <ULink to="/download">All downloads</ULink>
      </p>
    </template>
  </UPageCTA>
</template>
