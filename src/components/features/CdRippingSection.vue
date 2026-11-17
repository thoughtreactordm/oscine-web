<script setup lang="ts">
import type { TourShots } from "../../data/tour-shots";
import { SHOT_ALTS } from "../../data/learn-shots";
import TourShot from "../TourShot.vue";
import { sectionUi, sizes } from "./tour";

defineProps<{ shots: TourShots }>();
</script>

<template>
  <UPageSection
    id="cd-ripping"
    title="CD Ripping"
    orientation="horizontal"
    class="section-rule"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Pop in a CD and rip it straight into your library from the Tools tab. Oscine identifies the
        disc, looks it up on MusicBrainz, and lets you choose the right release when there are a
        few pressings to pick from. The cover art comes along from the Cover Art Archive.
      </p>
      <p class="mt-4">
        Each track is encoded to FLAC, tagged, named with a template you control, and added to your
        library as soon as it's done. Turn on verify to rip every track twice and compare, and if a
        rip gets interrupted you can pick it back up where it stopped.
      </p>
    </template>

    <TourShot :shot="shots.toolsCdrip" :alt="SHOT_ALTS['tools-cdrip']" :sizes="sizes.half" />
  </UPageSection>
</template>
