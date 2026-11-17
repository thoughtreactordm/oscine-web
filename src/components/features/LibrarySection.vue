<script setup lang="ts">
import type { TourShots } from "../../data/tour-shots";
import { SHOT_ALTS } from "../../data/learn-shots";
import ShotStack from "../ShotStack.vue";
import TourShot from "../TourShot.vue";
import { sectionUi, sizes } from "./tour";

defineProps<{ shots: TourShots }>();
</script>

<template>
  <UPageSection
    id="library"
    title="Library"
    orientation="horizontal"
    class="section-rule"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Like any local music player, the app's experience is driven by the music library you've
        cultivated. Add any number of folders to watch, browse them together or individually, and
        search amongst them using an instant search function.
      </p>
      <p class="mt-4">
        With source lists breaking tracks down by Genre/Tag, Artists, and Albums you can quickly
        scour through your collection and find just the right tunes to queue up.
      </p>
      <p class="mt-4">
        With the <strong>Songs</strong> list, take full control over which data columns you want to
        display, sort by, their position in the table, and more.
      </p>
    </template>

    <ShotStack pad="sm:pb-5" base="sm:w-full" overlay="sm:absolute sm:-inset-x-4 sm:bottom-0">
      <template #base>
        <TourShot
          :shot="shots.libraryHero"
          :alt="SHOT_ALTS['library-hero']"
          :sizes="sizes.half"
          loading="eager"
        />
      </template>
    </ShotStack>
  </UPageSection>
</template>
