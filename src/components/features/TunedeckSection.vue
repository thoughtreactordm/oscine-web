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
    id="tunedeck"
    title="Tunedeck"
    orientation="horizontal"
    class="section-rule"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        The Tunedeck is a drawer on the right side of the app that stays open while you browse.
        Its four tabs (Artist, Track, Related, and Playing) each give you a different look at
        whatever you're listening to.
      </p>
      <p class="mt-4">
        Related picks up the rest of the album first, then looser matches from your library by
        genre, year, or folder. Turn on online lookups and the Artist tab fills in with a biography
        and band line-ups. Leave them off and everything from your own library still works.
      </p>
    </template>

    <ShotStack>
      <template #base>
        <TourShot
          :shot="shots.tunedeckArtist"
          :alt="SHOT_ALTS['tunedeck-artist']"
          :sizes="sizes.stacked"
        />
      </template>
      <template #overlay>
        <TourShot
          :shot="shots.tunedeckRelated"
          :alt="SHOT_ALTS['tunedeck-related']"
          :sizes="sizes.inset"
          :frame="lifted"
        />
      </template>
    </ShotStack>
  </UPageSection>
</template>
