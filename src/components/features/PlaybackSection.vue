<script setup lang="ts">
import type { TourShots } from "../../data/tour-shots";
import { SHOT_ALTS } from "../../data/learn-shots";
import TourShot from "../TourShot.vue";
import { sectionUi, sizes } from "./tour";

defineProps<{ shots: TourShots }>();
</script>

<template>
  <UPageSection
    id="playback"
    title="Playback"
    orientation="horizontal"
    class="section-rule"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Playback is gapless by default. If you'd rather have a crossfade between tracks, set a
        duration and Oscine blends each song into the next.
      </p>
      <p class="mt-4">
        Oscine plays FLAC, MP3, Ogg Vorbis, Opus, AAC, and WAV. When your files carry
        <ULink to="/features/tools#replaygain" class="text-primary">ReplayGain</ULink> values,
        playback can use them by track or by album to keep the volume even.
      </p>
    </template>

    <TourShot
      :shot="shots.trackInfo"
      :alt="SHOT_ALTS['track-info']"
      :sizes="sizes.half"
      variant="natural"
    />
  </UPageSection>
</template>
