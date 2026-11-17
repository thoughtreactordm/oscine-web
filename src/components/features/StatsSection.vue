<script setup lang="ts">
import type { TourShots } from "../../data/tour-shots";
import { SHOT_ALTS } from "../../data/learn-shots";
import TourShot from "../TourShot.vue";
import { sectionUi, sizes } from "./tour";

defineProps<{ shots: TourShots }>();
</script>

<template>
  <UPageSection
    id="stats"
    title="Stats"
    orientation="horizontal"
    class="section-rule"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Stats is your listening log, with your top artists, albums, and tracks over whatever time
        range you pick. Every listen is recorded with the tags it had at the time, so renaming a
        track or reorganizing your folders later won't rewrite last year's numbers.
      </p>
    </template>

    <TourShot :shot="shots.stats" :alt="SHOT_ALTS.stats" :sizes="sizes.half" />
  </UPageSection>
</template>
