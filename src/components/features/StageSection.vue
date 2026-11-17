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
    id="stage"
    title="Stage & Zen"
    orientation="horizontal"
    class="section-rule"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        The Stage gives Now Playing the whole window, with the album art front and center and a
        waveform ribbon for the track you're hearing.
      </p>
      <p class="mt-4">
        Zen mode drops the title bar, the tabs, and the transport controls and goes fullscreen. Put
        it up on a TV or a second monitor and leave it running.
      </p>
    </template>

    <ShotStack>
      <template #base>
        <TourShot :shot="shots.stage" :alt="SHOT_ALTS.stage" :sizes="sizes.stacked" />
      </template>
      <template #overlay>
        <TourShot :shot="shots.zen" :alt="SHOT_ALTS.zen" :sizes="sizes.inset" :frame="lifted" />
      </template>
    </ShotStack>
  </UPageSection>
</template>
