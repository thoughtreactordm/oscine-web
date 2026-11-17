<script setup lang="ts">
import type { TourShots } from "../../data/tour-shots";
import { SHOT_ALTS } from "../../data/learn-shots";
import TourShot from "../TourShot.vue";
import { sectionUi, sizes } from "./tour";

defineProps<{ shots: TourShots }>();
</script>

<template>
  <UPageSection
    id="curate-discover"
    title="Curate & Discover"
    orientation="horizontal"
    class="section-rule"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Your playlists live on a rail along the left with My Favorites pinned to the top, and any of
        them can be exported to .m3u8 when you want to take a list somewhere else.
      </p>
      <p class="mt-4">
        The queue works in two layers. Tracks you add by hand sit above the rest of your session,
        so shuffling mixes up everything else and leaves the songs you picked out right where you
        put them.
      </p>
      <p class="mt-4">
        Discover builds shelves out of your own files and listening history using nine recipes,
        like Sitting unplayed, Forgotten favorites, and Almost finished. Every card tells you why
        it's there, and you can save any shelf you like as a playlist.
      </p>
    </template>

    <TourShot :shot="shots.curateDiscover" :alt="SHOT_ALTS['curate-discover']" :sizes="sizes.half" />
  </UPageSection>
</template>
