<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";
import type { Release } from "../data/release";
import { SHOT_ALTS } from "../data/learn-shots";
import DownloadButtons from "./DownloadButtons.vue";
import ShotFrame from "./ShotFrame.vue";

defineProps<{
  release: Release;
  /** Inlined 32px WebP washes, keyed to the shots passed in as slots. */
  blooms: {
    hero: string;
    pillarColumns: string;
    pillarStage: string;
    pillarThemePicker: string;
    tunedeckTrack: string;
  };
}>();

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
          class="hero-shot relative z-10 [&_img]:w-full [&_img]:rounded-xl [&_img]:ring-1 [&_img]:ring-default"
        >
          <slot name="hero" />
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
    </template>

    <ShotFrame :bloom="blooms.tunedeckTrack" :alt="SHOT_ALTS['tunedeck-track']">
      <slot name="tunedeck-track" />
    </ShotFrame>
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
