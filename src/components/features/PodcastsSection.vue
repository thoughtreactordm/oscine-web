<script setup lang="ts">
import type { TourShots } from "../../data/tour-shots";
import { SHOT_ALTS } from "../../data/learn-shots";
import TourShot from "../TourShot.vue";
import { sectionUi, sizes } from "./tour";

defineProps<{ shots: TourShots }>();
</script>

<template>
  <UPageSection
    id="podcasts"
    title="Podcasts"
    orientation="horizontal"
    class="section-rule"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Subscribe to your shows, download episodes, and listen, all from their own tab. Podcasts
        are kept apart from your music, so episodes never turn up in your library, your searches,
        or your ReplayGain.
      </p>
    </template>

    <TourShot :shot="shots.podcasts" :alt="SHOT_ALTS.podcasts" :sizes="sizes.half" />
  </UPageSection>
</template>
