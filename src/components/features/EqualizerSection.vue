<script setup lang="ts">
import type { TourShots } from "../../data/tour-shots";
import { SHOT_ALTS } from "../../data/learn-shots";
import TourShot from "../TourShot.vue";
import { sectionUi, sizes } from "./tour";

defineProps<{ shots: TourShots }>();
</script>

<template>
  <UPageSection
    id="equalizer"
    title="Equalizer"
    orientation="horizontal"
    class="section-rule"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Oscine has a full parametric equalizer in the Tools tab. Drag bands around right on the
        curve or type exact values into the table below it, with up to twelve bands of peaking,
        shelf, pass, and notch filters. A live spectrum runs behind the curve so you can see what
        you're shaping.
      </p>
      <p class="mt-4">
        Save the curves you like as presets and assign them to an album, artist, or playlist, and
        they'll switch in on their own when that music plays. If you already have a curve, import
        it from AutoEq or Equalizer APO, or pick your headphones from the 736 oratory1990 profiles
        that come bundled with the app.
      </p>
      <p class="mt-4">
        A preamp with auto-gain and a clip indicator help keep the bolder curves from distorting.
      </p>
    </template>

    <TourShot :shot="shots.toolsEqualizer" :alt="SHOT_ALTS['tools-equalizer']" :sizes="sizes.half" />
  </UPageSection>
</template>
