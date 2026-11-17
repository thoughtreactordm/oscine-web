<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";
import type { Component } from "vue";
import type { Release } from "../../data/release";
import type { FeatureTab, SectionId } from "../../data/features";
import type { TourShots } from "../../data/tour-shots";
import DownloadButtons from "../DownloadButtons.vue";
import AgentAccessSection from "./AgentAccessSection.vue";
import CdRippingSection from "./CdRippingSection.vue";
import CurateDiscoverSection from "./CurateDiscoverSection.vue";
import EqualizerSection from "./EqualizerSection.vue";
import FeatureTabs from "./FeatureTabs.vue";
import LibrarySection from "./LibrarySection.vue";
import LyricsSection from "./LyricsSection.vue";
import NoctaliaSection from "./NoctaliaSection.vue";
import PlaybackSection from "./PlaybackSection.vue";
import PodcastsSection from "./PodcastsSection.vue";
import QuickAccessSection from "./QuickAccessSection.vue";
import ReplayGainSection from "./ReplayGainSection.vue";
import ScrobblingSection from "./ScrobblingSection.vue";
import StageSection from "./StageSection.vue";
import StatsSection from "./StatsSection.vue";
import TagEditingSection from "./TagEditingSection.vue";
import ThemesSection from "./ThemesSection.vue";
import TunedeckSection from "./TunedeckSection.vue";
import VisualizersSection from "./VisualizersSection.vue";

defineProps<{
  release: Release;
  tab: FeatureTab;
  shots: TourShots;
}>();

const SECTIONS: Record<SectionId, Component> = {
  library: LibrarySection,
  podcasts: PodcastsSection,
  playback: PlaybackSection,
  stage: StageSection,
  lyrics: LyricsSection,
  visualizers: VisualizersSection,
  equalizer: EqualizerSection,
  tunedeck: TunedeckSection,
  "curate-discover": CurateDiscoverSection,
  stats: StatsSection,
  scrobbling: ScrobblingSection,
  "tag-editing": TagEditingSection,
  replaygain: ReplayGainSection,
  "cd-ripping": CdRippingSection,
  "agent-access": AgentAccessSection,
  themes: ThemesSection,
  noctalia: NoctaliaSection,
  "quick-access": QuickAccessSection,
};

/**
 * Sections with no shots yet (S-10 brings them). They take no `shots` prop, and
 * handing them one would fall through onto the <section> as an attribute.
 */
const COPY_ONLY = new Set<SectionId>([
  "lyrics",
  "visualizers",
  "scrobbling",
  "replaygain",
  "agent-access",
  "noctalia",
]);

const headerUi = {
  title: "text-left",
  description: "text-left",
  headline: "justify-start",
  links: "justify-start",
};

const heroLinks: ButtonProps[] = [
  { label: "Download", to: "/download", color: "primary" },
  { label: "Learn", to: "/learn", color: "neutral", variant: "subtle" },
];
</script>

<template>
  <div class="relative isolate">
    <div class="amber-glow amber-glow--top" aria-hidden="true" />
    <UContainer>
      <UPageHeader
        headline="Features"
        :title="tab.title"
        :description="tab.description"
        :links="heroLinks"
        :ui="headerUi"
        class="border-none"
      />
    </UContainer>
  </div>

  <FeatureTabs :active="tab.slug" />

  <!-- Alternate sides down the page; the tint alternates in global.css. -->
  <div class="feature-sections">
    <component
      :is="SECTIONS[id]"
      v-for="(id, i) in tab.sections"
      :key="id"
      v-bind="COPY_ONLY.has(id) ? {} : { shots }"
      :reverse="i % 2 === 1"
    />
  </div>

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
