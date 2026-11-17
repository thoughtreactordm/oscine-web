<script setup lang="ts">
import type { TourShots } from "../../data/tour-shots";
import { SHOT_ALTS } from "../../data/learn-shots";
import ShotStack from "../ShotStack.vue";
import TourShot from "../TourShot.vue";
import { lifted, sectionUi, sizes } from "./tour";

defineProps<{ shots: TourShots }>();
</script>

<template>
  <UPageSection
    id="quick-access"
    title="Quick access"
    orientation="horizontal"
    class="section-rule"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Press
        <UKbd>Ctrl</UKbd>
        <UKbd class="ml-1">K</UKbd>
        from anywhere to open the command palette. Start with a prefix to narrow it down:
        <code class="text-primary">&gt;</code>
        for actions,
        <code class="text-primary">@</code>
        for artists,
        <code class="text-primary">#</code>
        for playlists, and
        <code class="text-primary">/</code>
        for settings. You can start an artist playing or shuffle your whole library right from the
        palette.
      </p>
      <p class="mt-4">
        The Quick Menu on Now Playing keeps your favorite playlists, recent additions, and favorite
        artists a click away. The Tools menu in the title bar opens any tool, and it has the
        equalizer's on switch and your saved presets right there too.
      </p>
      <p class="mt-4">A set of global shortcuts covers playback and navigation.</p>
    </template>

    <ShotStack>
      <template #base>
        <TourShot :shot="shots.palette" :alt="SHOT_ALTS.palette" :sizes="sizes.stacked" />
      </template>
      <template #overlay>
        <TourShot
          :shot="shots.quickMenu"
          :alt="SHOT_ALTS['quick-menu']"
          :sizes="sizes.inset"
          :frame="lifted"
        />
      </template>
    </ShotStack>
  </UPageSection>
</template>
