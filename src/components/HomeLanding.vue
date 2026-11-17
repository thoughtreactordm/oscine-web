<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";
import { releaseLine, type Release } from "../data/release";
import { SHOT_ALTS } from "../data/learn-shots";
import DownloadButtons from "./DownloadButtons.vue";
import ShotFrame from "./ShotFrame.vue";

const props = defineProps<{
  release: Release;
  /** Inlined 32px WebP washes, keyed to the shots passed in as slots. */
  blooms: {
    hero: string;
    pillarColumns: string;
    pillarStage: string;
    pillarThemePicker: string;
    tunedeckTrack: string;
    exploreDiscover: string;
    exploreStats: string;
  };
}>();

/** The page's only version reference, read from the live release so it can't go stale. */
const releaseNote = `Oscine ${releaseLine(props.release.version)} is out`;

const alignStart = {
  title: "text-left",
  description: "text-left",
  headline: "justify-start",
  leading: "justify-start",
  links: "justify-start",
};

/** Section headings carry the accent; the hero and CTA titles stay plain. */
const sectionUi = { ...alignStart, title: "text-left section-title" };

const heroLinks: ButtonProps[] = [
  {
    label: "Download",
    to: "/download",
  },
  {
    label: "See features",
    to: "/features",
    color: "neutral",
    variant: "subtle",
    trailingIcon: "i-tabler-arrow-right",
  },
];

const pillars = [
  {
    title: "Control",
    slot: "pillar-columns",
    bloom: "pillarColumns",
    alt: SHOT_ALTS["pillar-columns"],
    fit: "[&_img]:object-left",
    description:
      "Oscine builds a data layer around the music you own. Giving you full control to <strong>browse, search,</strong> and <strong>modify</strong> your library without sacrificing efficiency or visual appeal.",
  },
  {
    title: "Elegance",
    slot: "pillar-stage",
    bloom: "pillarStage",
    alt: SHOT_ALTS["pillar-stage"],
    fit: "[&_img]:object-center",
    description:
      "<strong>You can have form and function</strong>. Modern streamers spend quality time refining their interfaces - why should a local player be any different?",
  },
  {
    title: "Personalization",
    slot: "pillar-theme-picker",
    bloom: "pillarThemePicker",
    alt: SHOT_ALTS["pillar-theme-picker"],
    fit: "[&_img]:object-top",
    description:
      "Themes and style customization make Oscine <strong>yours</strong>. Tune the look and feel of your player with a robust set of configurations and accessibility friendly colorization¹.",
  },
] as const;

/**
 * The tools strip. Each card links to its section on the Features page.
 * ReplayGain stops at measuring and review: writing gains to files is held
 * until the app's Windows run passes (see the oscine-site-1-2 gating table).
 */
const tools = [
  {
    title: "Equalizer",
    icon: "i-tabler-adjustments-horizontal",
    to: "/features#equalizer",
    description:
      "A parametric EQ with up to twelve bands and 736 bundled headphone profiles. Presets can switch in on their own for an album or artist.",
  },
  {
    title: "CD ripping",
    icon: "i-tabler-disc",
    to: "/features#cd-ripping",
    description:
      "Rip a CD straight to FLAC. Oscine finds the release on MusicBrainz and names each file with a template you set.",
  },
  {
    title: "Tag editing",
    icon: "i-tabler-tags",
    to: "/features#tag-editing",
    description:
      "Edit nearly every field a file can carry. Your changes wait for review, and Oscine backs up each file before writing to it.",
  },
  {
    title: "ReplayGain",
    icon: "i-tabler-volume",
    to: "/features#replaygain",
    description:
      "Measure loudness on your own computer to keep your library at an even volume. You review the values before anything is written to your files.",
  },
] as const;

/** Smaller crops under the Tunedeck shot in the explore section. */
const exploreShots = [
  { label: "Discover", slot: "explore-discover", bloom: "exploreDiscover", alt: SHOT_ALTS["explore-discover"] },
  { label: "Stats", slot: "explore-stats", bloom: "exploreStats", alt: SHOT_ALTS["explore-stats"] },
] as const;
</script>

<template>
  <section class="hero relative isolate">
    <div class="amber-glow amber-glow--top" aria-hidden="true" />

    <!-- Headline + shot share a stage: the copy is sticky WITHIN this stage, so
         it pins only while the shot is rising behind it and then unpins and
         scrolls away with the shot's tail — instead of staying pinned to the
         end of the hero and letting the trailing CTA climb right up under it. -->
    <div class="hero-stage">
      <!-- Headline + byline, pinned to the crown; the shot rises up behind them
           and dissolves into the light the copy's ::before lays over it. -->
      <div class="hero-copy">
        <UButton
          to="/changelog"
          :label="releaseNote"
          trailing-icon="i-tabler-arrow-right"
          color="primary"
          variant="subtle"
          size="sm"
          class="mb-5 rounded-full px-3.5"
        />
        <h1
          class="display text-balance text-4xl font-semibold tracking-tight text-highlighted sm:text-5xl lg:text-6xl"
        >
          A Future Forward Music Player
        </h1>
        <p class="mt-4 text-xl text-muted sm:text-2xl">Oscine is <slot name="hero-byline" /> </p>
      </div>

      <!-- The whole app window, in normal flow. It scrolls up behind the copy as
           the page scrolls, and its bottom edge marks where the copy unpins. -->
      <div class="hero-shot-track">
        <div
          class="hero-bloom"
          :style="{ backgroundImage: `url('${blooms.hero}')` }"
          aria-hidden="true"
        />
        <div
          class="hero-shot relative z-10 [&_img]:w-full [&_img]:rounded-xl [&_img]:ring-1 [&_img]:ring-default [&_video]:block [&_video]:h-auto [&_video]:w-full [&_video]:rounded-xl [&_video]:ring-1 [&_video]:ring-default"
        >
          <slot name="hero" />
          <!-- Pause/play for the looping hero video (WCAG 2.2.2). The page
               script unhides it; without JS the poster just sits still. -->
          <button
            type="button"
            data-hero-toggle
            hidden
            aria-label="Pause video"
            class="group absolute right-3 bottom-3 z-20 flex size-9 items-center justify-center rounded-full bg-default/70 text-highlighted ring-1 ring-default backdrop-blur transition hover:bg-default/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <UIcon name="i-tabler-player-pause-filled" class="hidden size-4 group-data-[playing=true]:block" />
            <UIcon name="i-tabler-player-play-filled" class="block size-4 group-data-[playing=true]:hidden" />
          </button>
        </div>
      </div>
    </div>

    <!-- Download CTA pinned to the floor; unpins the instant the shot clears
         it, then scrolls away in tandem. -->
    <div class="hero-cta">
      <p
        class="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-sm font-semibold text-highlighted sm:text-base"
      >
        <span>Available for</span>
        <span class="inline-flex items-center gap-1.5">
          <UIcon name="i-tabler-brand-windows" class="size-[1.15em] text-primary" />
          Windows
        </span>
        <span class="text-dimmed">&amp;</span>
        <span class="inline-flex items-center gap-1.5">
          <UIcon name="i-simple-icons-linux" class="size-[1.15em] text-primary" />
          Linux
        </span>
      </p>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        <UButton v-for="link in heroLinks" :key="link.label" v-bind="link" size="lg" />
      </div>
    </div>
  </section>

  <UPageSection class="section-rule" :ui="{ ...sectionUi, body: 'mt-0' }">
    <template #body>
      <h2 class="text-3xl mb-12 text-center wordmark text-primary">
        If music is what drives you. Oscine lets you take the wheel.
      </h2>

      <UPageGrid>
        <UPageCard
          v-for="pillar in pillars"
          :key="pillar.title"
          :title="pillar.title"
          variant="subtle"
          class="transition-all duration-300 hover:ring-primary/25 hover:-translate-y-4 hover:scale-[1.05]"
          :ui="{ title: 'text-center text-2xl pb-2'}"
        >
          <template #description> <span v-html="pillar.description"></span> </template>
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

      <p class="text-dimmed text-xs italic mt-6 mx-auto text-center w-140">
        ¹: Oscine monitors color combinations against the WCAG 2.1 AA standards of web accessibility
        to help ensure readability for all persons. Our tool cannot guarantee 100% readability for
        all color combinations.
      </p>
    </template>
  </UPageSection>

  <UPageSection
    id="tools"
    title="Tools for your collection"
    description="The jobs that usually send you off to a separate program are built into Oscine."
    class="section-rule"
    :ui="{ ...sectionUi, body: 'mt-10' }"
  >
    <template #body>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UPageCard
          v-for="tool in tools"
          :key="tool.title"
          :title="tool.title"
          :description="tool.description"
          :icon="tool.icon"
          :to="tool.to"
          variant="subtle"
          class="transition-all duration-300 hover:ring-primary/25 hover:-translate-y-1"
          :ui="{ leadingIcon: 'size-7 text-primary', title: 'text-lg' }"
        />
      </div>
    </template>
  </UPageSection>

  <UPageSection
    id="explore"
    title="Dive into your tunes"
    orientation="horizontal"
    class="section-rule bg-elevated/40"
    :ui="sectionUi"
  >
    <template #description>
      <p class="font-semibold mb-3">Sometimes there is more to the music than just soundwaves.</p>
      <p class="text-dimmed">
        For those who want to dig a little deeper into their favorite tracks and artists, Oscine
        provides the <em>Tunedeck</em> - a sidekick that provides contextual information to whatever
        you're jamming to.
      </p>
      <p class="text-dimmed mt-3">
        <em>Discover</em> turns your own library and listening history into shelves like Sitting
        unplayed and Forgotten favorites, and any shelf you like can be saved as a playlist.
      </p>
      <p class="text-dimmed mt-3">
        <em>Stats</em> keeps a log of what you've played, with your top artists, albums, and tracks
        for the range you pick.
      </p>
    </template>

    <div class="space-y-5">
      <ShotFrame :bloom="blooms.tunedeckTrack" :alt="SHOT_ALTS['tunedeck-track']">
        <slot name="tunedeck-track" />
      </ShotFrame>

      <div class="grid grid-cols-2 gap-4 sm:gap-5">
        <figure v-for="shot in exploreShots" :key="shot.slot" class="min-w-0">
          <ShotFrame
            :bloom="blooms[shot.bloom]"
            :alt="shot.alt"
            class="[&_picture]:block [&_img]:w-full"
          >
            <slot :name="shot.slot" />
          </ShotFrame>
          <figcaption class="mt-2.5 text-sm font-semibold text-muted">{{ shot.label }}</figcaption>
        </figure>
      </div>
    </div>
  </UPageSection>

  <UPageSection title="A Better Harmony" class="section-rule" :ui="{ title: 'text-primary' }">
    <template #body>
      <section class="grid grid-cols-1 md:grid-cols-2 items-center">
        <div class="grid grid-cols-3 items-start text-center px-8 gap-2 mb-4 md:mb-0">
          <div class="font-semibold flex flex-col items-center justify-start gap-3 py-4 text-muted">
            <UIcon name="i-tabler-devices" class="size-12 text-primary" />
            Vibrant & Responsive Interface
          </div>
          <div class="font-semibold flex flex-col items-center justify-start gap-3 py-4 text-muted">
            <UIcon name="i-tabler-database" class="size-12 text-primary" />
            Data-driven Library Management
          </div>
          <div class="font-semibold flex flex-col items-center justify-start gap-3 py-4 text-muted">
            <UIcon name="i-tabler-adjustments" class="size-12 text-primary" />
            Fully Customizable Configuration
          </div>
          <div class="font-semibold flex flex-col items-center justify-start gap-3 py-4 text-muted">
            <UIcon name="i-tabler-rocket" class="size-12 text-primary" />
            Future Forward & Evolving
          </div>
          <div class="font-semibold flex flex-col items-center justify-start gap-3 py-4 text-muted">
            <UIcon name="i-tabler-microphone-2" class="size-12 text-primary" />
            Artist-focused Philosophy
          </div>
          <div class="font-semibold flex flex-col items-center justify-start gap-3 py-4 text-muted">
            <UIcon name="i-tabler-accessible" class="size-12 text-primary" />
            First Class Accessibility
          </div>
        </div>
        <div
          class="max-w-2xl space-y-4 border-t md:border-t-0 md:border-l border-primary/25 px-8 text-dimmed pt-8"
        >
          <p class="mb-3 text-muted font-semibold">
            Free yourself from the enshitification of music listening.
          </p>
          <p>
            Everything these days is behind a subscription. You're renting your music and artists
            get screwed in the process.
          </p>
          <p>
            Ditching Spotify or Apple Music comes with a huge loss of access and cost barriers for
            many; but for music nerds with a means to buy permanent media, why settle for a music
            player that looks like it is from the Windows XP days or where customizing feels like a
            coding task?
          </p>
          <p class="italic">
            Supporting artists as directly as possible and using local players, like Oscine, is how
            we turn the tides on these abusive industry practices.
          </p>
          <div class="pt-2 flex justify-end">
            <UButton
              to="/features"
              color="primary"
              variant="ghost"
              trailing-icon="i-tabler-arrow-right"
            >
              See features in depth
            </UButton>
          </div>
        </div>
      </section>
    </template>
  </UPageSection>

  <UPageSection
    title="FAQs"
    :ui="{ root: 'bg-muted/40 border-t border-muted/40', title: 'text-primary'}"
  >
    <template #body> <slot name="faqs" /> </template>
  </UPageSection>

  <div class="relative isolate">
    <div class="amber-glow amber-glow--bottom" aria-hidden="true" />
    <UPageCTA
      variant="naked"
      class="section-rule rounded-none"
      title="Get Oscine."
      description="Free for Windows and Linux."
    >
      <template #body> <DownloadButtons :release="release" /> </template>
      <template #footer>
        <p class="text-sm text-dimmed text-center"><ULink to="/download">All downloads</ULink></p>
      </template>
    </UPageCTA>
  </div>
</template>
