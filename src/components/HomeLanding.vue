<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
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

const heroLinks: ButtonProps[] = [
  {
    label: 'Download',
    to: '/download'
  },
  {
    label: 'See features',
    to: '/features',
    color: 'neutral',
    variant: 'subtle',
    trailingIcon: 'i-tabler-arrow-right'
  }
]

const pillars = [
  {
    title: 'Control',
    slot: 'pillar-columns',
    fit: '[&_img]:object-left',
    description:
      'You get a real queue, playlists you keep, ReplayGain, and gapless playback. Format readouts, tag editing, and the keyboard sit on the track list, the way they do in foobar2000 and fooyin.'
  },
  {
    title: 'Design',
    slot: 'pillar-stage',
    fit: '[&_img]:object-center',
    description:
      'The interface is from this decade, made with care. The Stage fills the window with the cover, a waveform ribbon, and the track you are hearing.'
  },
  {
    title: 'Yours',
    slot: 'pillar-theme-picker',
    fit: '[&_img]:object-top',
    description:
      'Three themes, each in light and dark, and a token editor for color, type, and motion. The accent can follow the current cover, and you can strip the shell down to what you use.'
  }
] as const
</script>

<template>
  <UPageHero
    title="Your library, taken seriously."
    description="I made Oscine because I wanted a local player with foobar's control, an interface I actually enjoyed looking at, and quicker ways to get at everything I care about in the music I already own."
    :links="heroLinks"
    :ui="{ ...alignStart, description: 'text-left max-w-2xl' }"
  >
    <div class="overflow-hidden rounded-xl ring ring-default shadow-2xl shadow-black/40">
      <slot name="hero" />
    </div>
  </UPageHero>

  <UPageSection class="border-t border-default" :ui="{ ...alignStart, body: 'mt-0' }">
    <template #body>
      <UPageGrid>
        <UPageCard
          v-for="pillar in pillars"
          :key="pillar.title"
          :title="pillar.title"
          :description="pillar.description"
          variant="subtle"
        >
          <div
            class="aspect-[1280/820] overflow-hidden rounded-lg bg-elevated ring ring-default [&_picture]:block [&_picture]:size-full [&_img]:size-full [&_img]:object-cover"
            :class="pillar.fit"
          >
            <slot :name="pillar.slot" />
          </div>
        </UPageCard>
      </UPageGrid>
    </template>
  </UPageSection>

  <UPageSection
    title="Tunedeck"
    orientation="horizontal"
    class="border-t border-default bg-elevated/40"
    :ui="alignStart"
  >
    <template #description>
      <p>
        A drawer on the right that stays open while you browse. It shows who made the track you're
        hearing, what the file actually is, what's coming up, and what else in your library is
        related.
      </p>
      <p class="mt-4">
        Turn on online lookups and it adds a biography and line-ups; leave them off and everything
        local still works.
      </p>
    </template>

    <div class="overflow-hidden rounded-xl ring ring-default shadow-xl shadow-black/30">
      <slot name="tunedeck-track" />
    </div>
  </UPageSection>

  <UPageSection title="Why" class="border-t border-default" :ui="alignStart">
    <template #body>
      <div class="max-w-2xl space-y-4 text-muted">
        <p>
          I came from foobar2000 and fooyin, and I wanted that control in an interface I was happy
          to look at for hours.
        </p>
        <p>
          I left streaming after playlists I had spent years on rotted when tracks disappeared. I
          rebuilt a local library and needed a player that treated those files as the point.
        </p>
        <p>
          I built Oscine around my own tastes and workflow, and around a wish for easier access to
          information about my favorite music. I'm sharing it because it might fit yours.
        </p>
        <p class="pt-2">
          <UButton to="/features" color="primary" variant="link" trailing-icon="i-tabler-arrow-right">
            See features
          </UButton>
        </p>
      </div>
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
