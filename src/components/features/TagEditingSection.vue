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
    id="tag-editing"
    title="Tag Editing"
    orientation="horizontal"
    class="section-rule"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Clean up your tags without leaving the app. The editor covers nearly every field a
        file can carry, from album artist and composers to sort names, ISRCs, and MusicBrainz IDs.
      </p>
      <p class="mt-4">
        Your edits don't touch the files right away. They're staged in the Tools tab, where you can
        look over every change side by side and pick exactly what gets written. Oscine keeps a
        backup of each original until the write checks out, and puts it back if anything doesn't
        match.
      </p>
    </template>

    <ShotStack>
      <template #base>
        <TourShot :shot="shots.tagEditor" :alt="SHOT_ALTS['tag-editor']" :sizes="sizes.stacked" />
      </template>
      <template #overlay>
        <TourShot
          :shot="shots.toolsWriteback"
          :alt="SHOT_ALTS['tools-writeback']"
          :sizes="sizes.inset"
          :frame="lifted"
        />
      </template>
    </ShotStack>
  </UPageSection>
</template>
