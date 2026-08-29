<script setup lang="ts">
import type { ButtonProps, PageFeatureProps } from '@nuxt/ui'
import { albumCountFor, mockNowPlaying } from '../data/mock-library'
import type { Release } from '../data/release'
import DownloadButtons from './DownloadButtons.vue'

defineProps<{
  release: Release
}>()

const alignStart = {
  title: 'text-left',
  description: 'text-left',
  headline: 'justify-start',
  leading: 'justify-start',
  links: 'justify-start'
}

const pillars = [
  {
    title: 'Your whole library',
    description:
      'Point Oscine at your folders and browse by artist, album, and song. Search is instant, and it stays fast no matter how large your collection gets.'
  },
  {
    title: 'Playlists and a real queue',
    description:
      'Playlists you keep and an up-next you can edit. Shuffle leaves the tracks you queued by hand in place. Choose gapless or crossfade, per album if you want.'
  },
  {
    title: 'Even loudness',
    description:
      'ReplayGain is applied when the tags are there and measured in the background when they are not. Albums keep their dynamics, and playlists do not lurch in volume between tracks.'
  }
]

const tunedeckLinks: ButtonProps[] = [
  {
    label: 'Using the Tunedeck',
    to: '/learn/tunedeck',
    color: 'primary',
    variant: 'link',
    trailingIcon: 'i-tabler-arrow-right'
  }
]

const themes = [
  {
    title: 'Oscine',
    description: 'Warm amber on taupe. The house look.',
    swatch: 'bg-gradient-to-br from-amber-400 to-stone-800'
  },
  {
    title: 'Nocturne',
    description: 'Cold verdigris on a blue-shifted grey.',
    swatch: 'bg-gradient-to-br from-teal-400 to-slate-900'
  },
  {
    title: 'High Contrast',
    description: 'Every weight pushed apart. For bright rooms.',
    swatch: 'bg-gradient-to-br from-sky-300 to-slate-950'
  }
]

const themeLinks: ButtonProps[] = [
  {
    label: 'Themes and the token editor',
    to: '/learn/themes',
    color: 'primary',
    variant: 'link',
    trailingIcon: 'i-tabler-arrow-right'
  }
]

const features: PageFeatureProps[] = [
  {
    icon: 'i-tabler-layout-sidebar-right',
    title: 'Tunedeck',
    description:
      'Who made this, what the file is, what’s up next, and related music you already own. A drawer you can open and leave open.'
  },
  {
    icon: 'i-tabler-palette',
    title: 'Themes you can author',
    description:
      'Oscine, Nocturne, and High Contrast out of the box, plus a token editor for colour, type, and motion. The accent can follow the current cover.'
  },
  {
    icon: 'i-tabler-terminal-2',
    title: 'Command palette',
    description:
      'Ctrl+K from anywhere. Jump to a view, an album, a playlist, a setting. Prefixes when you want precision: > actions, @ artists, # playlists, / settings.'
  },
  {
    icon: 'i-tabler-sparkles',
    title: 'Discover you can explain',
    description:
      'Shelves built from your library and your listening history. Named recipes instead of a black box, stable through the day, with a one-line reason on every card.'
  },
  {
    icon: 'i-tabler-microphone',
    title: 'Podcasts, on disk',
    description:
      'Subscribe, download, then play. Episodes live alongside your music without being mixed into the same library.'
  },
  {
    icon: 'i-tabler-chart-histogram',
    title: 'Stats that remember',
    description:
      'A listening log that survives a folder reorganise. Top artists, albums, and hours for any range you choose.'
  }
]
</script>

<template>
  <UPageHero
    headline="Local music player"
    title="A better player for the music you own."
    description="Oscine is for people who already keep a real collection: folders on disk, playlists they built themselves, tags they care about. It gives you power-user control in a modern interface."
    orientation="horizontal"
    :ui="alignStart"
  >
    <template #top>
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.55_0.14_70_/_0.18),_transparent_55%)]"
      />
    </template>

    <template #body>
      <DownloadButtons :release="release" />
    </template>

    <template #footer>
      <p class="text-sm text-dimmed">Windows and Linux · Free · No account · v{{ release.version }}</p>
    </template>

    <slot />
  </UPageHero>

  <UPageSection
    title="Built for the way you already listen."
    description="If you came from foobar2000, fooyin, MusicBee, or a folder full of files, you already know what you want. Oscine keeps that control and gives it a modern interface."
    class="border-t border-default"
    :ui="alignStart"
  >
    <template #body>
      <UPageGrid>
        <UPageCard
          v-for="pillar in pillars"
          :key="pillar.title"
          :title="pillar.title"
          :description="pillar.description"
          variant="subtle"
        />
      </UPageGrid>
    </template>
  </UPageSection>

  <UPageSection
    headline="Tunedeck"
    title="One drawer for everything about what's playing."
    orientation="horizontal"
    class="border-t border-default bg-elevated/40"
    :ui="alignStart"
    :links="tunedeckLinks"
  >
    <template #description>
      <p>
        Four tabs: artist, track, related, and playing. A biography and line-ups, the file's format
        and ReplayGain, what's up next, and a trail of what you just heard. Related music is matched
        against <em>your</em> library, not a catalogue you will never own.
      </p>
      <p class="mt-4 text-sm">
        Online lookups are optional. Turn them off and every local pane still works.
      </p>
    </template>

    <UPageCard variant="subtle">
      <div class="flex gap-2 text-xs font-medium text-muted">
        <UBadge color="neutral" variant="subtle">Artist</UBadge>
        <span class="px-2 py-1">Track</span>
        <span class="px-2 py-1">Related</span>
        <span class="px-2 py-1">Playing</span>
      </div>
      <div class="mt-5 space-y-3">
        <div class="flex items-center gap-3">
          <img
            :src="mockNowPlaying.cover"
            alt=""
            width="48"
            height="48"
            class="size-12 shrink-0 rounded-md object-cover"
          />
          <div class="min-w-0">
            <p class="text-xs text-dimmed">Now playing</p>
            <p class="truncate text-lg font-semibold text-highlighted">{{ mockNowPlaying.title }}</p>
            <p class="truncate text-sm text-muted">
              {{ mockNowPlaying.artist }} · {{ mockNowPlaying.album }}
            </p>
          </div>
        </div>
        <USeparator />
        <ul class="space-y-2 text-sm text-muted">
          <li>In your library: {{ albumCountFor(mockNowPlaying.artist) }} albums</li>
          <li>Members matched to artists you own</li>
          <li>Up next: 12 in the queue</li>
        </ul>
      </div>
    </UPageCard>
  </UPageSection>

  <UPageSection
    title="Make it look like yours."
    description="Three built-in themes, each with a light and dark variant, and a token editor when you want to go further. Reactive colour pulls an accent from the current cover until you set one yourself."
    class="border-t border-default"
    :ui="alignStart"
    :links="themeLinks"
  >
    <template #body>
      <UPageGrid>
        <UPageCard
          v-for="theme in themes"
          :key="theme.title"
          :title="theme.title"
          :description="theme.description"
          reverse
        >
          <div class="h-28" :class="theme.swatch" />
        </UPageCard>
      </UPageGrid>
    </template>
  </UPageSection>

  <UPageSection
    headline="Why local still matters"
    title="Streaming sold you convenience. The files are still yours."
    orientation="horizontal"
    class="border-t border-default"
    :ui="alignStart"
  >
    <div class="space-y-4 text-muted">
      <p>
        A streaming catalogue is a lease. Tracks disappear overnight, and playlists you spent years
        on break when a label pulls a master. The artist on the other end sees a fraction of a cent.
      </p>
      <p>
        If you bought the record, ripped the CD, or paid for the Bandcamp download, that music is
        already yours. Oscine plays those files, with no account and no catalogue that can vanish out
        from under you.
      </p>
    </div>
  </UPageSection>

  <UPageSection
    title="Everything within reach."
    description="A Quick Menu on Now Playing for your favorite playlists, recent additions, and favorite artists. Last.fm and ListenBrainz for scrobbling. Settings you can search."
    class="border-t border-default bg-elevated/40"
    :ui="alignStart"
    :features="features"
  />

  <UPageCTA
    variant="naked"
    class="rounded-none border-t border-default"
    title="Get Oscine."
    description="Free for Windows and Linux. Download it, point it at a folder, and start playing."
    :ui="alignStart"
  >
    <template #body>
      <DownloadButtons :release="release" />
    </template>
    <template #footer>
      <p class="text-sm text-dimmed">
        <ULink to="/download">All downloads and formats</ULink>
        ·
        <ULink to="/learn/getting-started">Getting started</ULink>
      </p>
    </template>
  </UPageCTA>
</template>
