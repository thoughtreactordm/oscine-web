<script setup lang="ts">
import type { TourShots } from "../../data/tour-shots";
import { SHOT_ALTS } from "../../data/learn-shots";
import TourShot from "../TourShot.vue";
import { sectionUi, sizes } from "./tour";

defineProps<{ shots: TourShots }>();
</script>

<template>
  <UPageSection
    id="themes"
    title="Themes"
    class="section-rule"
    :ui="{ ...sectionUi, body: 'mt-8' }"
  >
    <template #description>
      <p>
        Oscine comes with three themes, Oscine, Nocturne, and High Contrast, and each one has a
        light and a dark variant. If you want to take it further, the theme editor lets you adjust
        color, type, and motion right down to the individual tokens. When a color pairing gets hard
        to read, a contrast warning shows up on the row that caused it.
      </p>
      <p class="mt-4">
        You can also let the accent color follow the album art of whatever's playing. An accent you
        set by hand in the editor always takes priority.
      </p>
    </template>

    <template #body>
      <!-- Fanned rather than flush: three windows in a row is the flattest thing on the page. -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        <figure class="min-w-0 sm:mt-8">
          <TourShot
            :shot="shots.themeOscineDark"
            :alt="SHOT_ALTS['theme-oscine-dark']"
            :sizes="sizes.trio"
          />
          <figcaption class="mt-2.5 text-sm text-muted">Oscine dark</figcaption>
        </figure>
        <figure class="min-w-0">
          <TourShot
            :shot="shots.themeOscineLight"
            :alt="SHOT_ALTS['theme-oscine-light']"
            :sizes="sizes.trio"
          />
          <figcaption class="mt-2.5 text-sm text-muted">Oscine light</figcaption>
        </figure>
        <figure class="min-w-0 sm:mt-8">
          <TourShot
            :shot="shots.themeNocturne"
            :alt="SHOT_ALTS['theme-nocturne']"
            :sizes="sizes.trio"
          />
          <figcaption class="mt-2.5 text-sm text-muted">Nocturne</figcaption>
        </figure>
      </div>
      <div class="mt-8">
        <TourShot :shot="shots.themeEditor" :alt="SHOT_ALTS['theme-editor']" :sizes="sizes.full" />
      </div>
    </template>
  </UPageSection>
</template>
