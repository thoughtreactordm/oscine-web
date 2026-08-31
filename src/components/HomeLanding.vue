<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { Release } from '../data/release'
import { SHOT_ALTS } from '../data/learn-shots'
import DownloadButtons from './DownloadButtons.vue'
import ShotFrame from './ShotFrame.vue'

defineProps<{
  release: Release
  /** Inlined 32px WebP washes, keyed to the shots passed in as slots. */
  blooms: {
    hero: string
    pillarColumns: string
    pillarStage: string
    pillarThemePicker: string
    tunedeckTrack: string
  }
}>()

const alignStart = {
  title: 'text-left',
  description: 'text-left',
  headline: 'justify-start',
  leading: 'justify-start',
  links: 'justify-start'
}

/** Section headings carry the accent; the hero and CTA titles stay plain. */
const sectionUi = { ...alignStart, title: 'text-left section-title' }

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
    bloom: 'pillarColumns',
    alt: SHOT_ALTS['pillar-columns'],
    fit: '[&_img]:object-left',
    description:
      'You get a real queue, playlists you keep, ReplayGain, and gapless playback. Format readouts, tag editing, and the keyboard sit on the track list, the way they do in foobar2000 and fooyin.'
  },
  {
    title: 'Design',
    slot: 'pillar-stage',
    bloom: 'pillarStage',
    alt: SHOT_ALTS['pillar-stage'],
    fit: '[&_img]:object-center',
    description:
      'The interface is from this decade, made with care. The Stage fills the window with the cover, a waveform ribbon, and the track you are hearing.'
  },
  {
    title: 'Yours',
    slot: 'pillar-theme-picker',
    bloom: 'pillarThemePicker',
    alt: SHOT_ALTS['pillar-theme-picker'],
    fit: '[&_img]:object-top',
    description:
      'Three themes, each in light and dark, and a token editor for color, type, and motion. The accent can follow the current cover, and you can strip the shell down to what you use.'
  }
] as const
</script>

<template>
  <div class="relative isolate">
    <div class="amber-glow amber-glow--top" aria-hidden="true" />

    <UPageHero
      title="Your library, taken seriously."
      description="I made Oscine because I wanted a local player with foobar's control, an interface I actually enjoyed looking at, and quicker ways to get at everything I care about in the music I already own."
      :links="heroLinks"
      :ui="{ ...alignStart, description: 'text-left max-w-2xl' }"
    >
      <ShotFrame :bloom="blooms.hero" :alt="SHOT_ALTS['library-hero']">
        <slot name="hero" />
      </ShotFrame>
    </UPageHero>
  </div>

  <UPageSection class="section-rule" :ui="{ ...sectionUi, body: 'mt-0' }">
    <template #body>
      <UPageGrid>
        <UPageCard
          v-for="pillar in pillars"
          :key="pillar.title"
          :title="pillar.title"
          :description="pillar.description"
          variant="subtle"
          class="transition-colors duration-300 hover:ring-primary/25"
        >
          <ShotFrame
            :bloom="blooms[pillar.bloom]"
            :alt="pillar.alt"
            aspect
            class="[&_picture]:block [&_picture]:size-full [&_img]:size-full [&_img]:object-cover"
            :class="pillar.fit"
          >
            <slot :name="pillar.slot" />
          </ShotFrame>
        </UPageCard>
      </UPageGrid>
    </template>
  </UPageSection>

  <UPageSection
    title="Tunedeck"
    orientation="horizontal"
    class="section-rule bg-elevated/40"
    :ui="sectionUi"
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

    <ShotFrame :bloom="blooms.tunedeckTrack" :alt="SHOT_ALTS['tunedeck-track']">
      <slot name="tunedeck-track" />
    </ShotFrame>
  </UPageSection>

  <UPageSection title="Why" class="section-rule" :ui="sectionUi">
    <template #body>
      <div
        class="max-w-2xl space-y-4 border-l border-primary/25 pl-5 text-muted sm:pl-6"
      >
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

  <div class="relative isolate">
    <div class="amber-glow amber-glow--bottom" aria-hidden="true" />
    <UPageCTA
      variant="naked"
      class="section-rule rounded-none"
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
  </div>
</template>
