<script setup lang="ts">
import { centeredUi } from "./tour";
</script>

<!-- Copy only until S-10 brings the shots. -->
<template>
  <UPageSection id="noctalia" title="Noctalia sync" class="section-rule" :ui="centeredUi">
    <template #description>
      <p>
        If you run the Noctalia shell on Linux, Oscine can take its colors from your desktop. Pick
        Noctalia as the color source in the theme settings and Oscine sets itself up inside
        Noctalia, so every time you change your color scheme, Oscine changes right along with it.
      </p>
      <p class="mt-4">
        Surfaces, text, and the supporting colors follow your desktop. The accent stays with your
        theme, or with the album art if you've set it to follow.
      </p>
    </template>
  </UPageSection>
</template>
