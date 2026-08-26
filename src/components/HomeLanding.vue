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
    title: 'A library, not a feed',
    description:
      'Point Oscine at your folders. Browse by artist, album, and song. Search is instant. It handles whatever library you throw at it.'
  },
  {
    title: 'Queue like you mean it',
    description:
      'Playlists you keep, an up-next you can edit, shuffle that does not vandalise what you queued by hand. Gapless or crossfade — you pick, per album if you want.'
  },
  {
    title: 'Loudness that behaves',
    description:
      'ReplayGain when the tags are there, measured in the background when they are not. Records stay records. Playlists do not jump 8 dB between tracks.'
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
      'Who made this, what the file actually is, what’s up next, and related music you already own. A drawer you open and leave open.'
  },
  {
    icon: 'i-tabler-palette',
    title: 'Themes you can author',
    description:
      'Oscine, Nocturne, and High Contrast out of the box. A token editor for colour, type, and motion — plus an accent that can follow the cover.'
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
      'Shelves built from your library and what you actually listened to. Named recipes, not a model. Same day, same shelves — and a one-line why on every card.'
  },
  {
    icon: 'i-tabler-microphone',
    title: 'Podcasts, on disk',
    description:
      'Subscribe, download, then play. Episodes live beside your music without pretending they are tracks in the same library.'
  },
  {
    icon: 'i-tabler-chart-histogram',
    title: 'Stats that remember',
    description:
      'A listening log that survives a folder reorganise. Top artists, albums, and the hours — for any range you ask.'
  }
]
</script>

<template>
  <UPageHero
    headline="Local music player"
    title="Your library deserves a better player."
    description="Oscine is for people who already keep a real collection — folders on disk, playlists that mean something, a player that still lets you drive. Power-user control. A modern interface."
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
    description="If you came from foobar, fooyin, MusicBee, or a folder and a prayer, you already know what you want. Oscine keeps the control and drops the chrome from 2004."
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
    title="The drawer power users open and leave open."
    orientation="horizontal"
    class="border-t border-default bg-elevated/40"
    :ui="alignStart"
    :links="tunedeckLinks"
  >
    <template #description>
      <p>
        Artist, track, related, playing. Biography and line-ups when you want them. Format,
        ReplayGain, and the decode path when you are curious. Up next and a trail of what you just
        heard. Related music is matched against <em>your</em> library — not a catalogue you do not
        own.
      </p>
      <p class="mt-4 text-sm">
        Online lookups are opt-in. Decline them and every local pane still works.
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
          <li>In your library — {{ albumCountFor(mockNowPlaying.artist) }} albums</li>
          <li>Members matched to artists you own</li>
          <li>Up next — 12 in the queue</li>
        </ul>
      </div>
    </UPageCard>
  </UPageSection>

  <UPageSection
    title="Make it look like yours."
    description="Three shipped themes, each with light and dark. A token editor when you want to go further. Reactive colour pulls an accent from whatever is playing — until you set one yourself."
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
        A streaming catalogue is a lease. Tracks vanish overnight. Playlists you spent years on rot
        when a label pulls a master. The artist on the other end of that stream sees a fraction of a
        cent.
      </p>
      <p>
        If you bought the record, ripped the CD, or paid the Bandcamp total, that library is already
        paid for. Oscine plays those files. No account. No disappearing catalogue. No cut of a listen
        that already belongs to you.
      </p>
    </div>
  </UPageSection>

  <UPageSection
    title="Everything in reach."
    description="Quick Menu on Now Playing for favorite playlists, recent additions, and favorite artists. Last.fm and ListenBrainz when you want the scrobble. A settings surface you can search."
    class="border-t border-default bg-elevated/40"
    :ui="alignStart"
    :features="features"
  />

  <UPageCTA
    variant="naked"
    class="rounded-none border-t border-default"
    title="Get Oscine."
    description="Free for Windows and Linux. Oscine is new — download it, point it at a folder, and put a record on."
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
