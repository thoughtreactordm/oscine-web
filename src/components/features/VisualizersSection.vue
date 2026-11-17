<script setup lang="ts">
import { centeredUi } from "./tour";
</script>

<!--
  Copy only until S-10 brings the shots. Gating: no claims about Windows or
  integrated GPUs until W23-15 passes, and the flash guard limits flashing,
  never "photosensitivity-safe".
-->
<template>
  <UPageSection id="visualizers" title="Visualizers" class="section-rule" :ui="centeredUi">
    <template #description>
      <p>
        Turn on a visualizer and the Stage background moves with whatever's playing. The cover and
        track info move up into the corner to make room.
      </p>
      <p class="mt-4">
        There are thirteen to choose from, like Bars, Halo, Rainfall, Murmuration, and a stereo
        Phase scope. Flip through them right from the Stage, or have Oscine switch to a new one
        every time the track changes. They can come along into Zen mode too, if you want them
        there.
      </p>
      <p class="mt-4">
        Visualizers stay off until you turn them on. Every one of them limits sudden flashing, and
        if your system is set to reduce motion, they stay off.
      </p>
    </template>
  </UPageSection>
</template>
