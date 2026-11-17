<script setup lang="ts">
import { centeredUi } from "./tour";
</script>

<!--
  Copy only until S-10 brings the shots. Gating: describe measuring and review,
  not writing values to files (held until the app's Windows run passes), and
  leave Opus out (not measured yet).
-->
<template>
  <UPageSection id="replaygain" title="ReplayGain" class="section-rule" :ui="centeredUi">
    <template #description>
      <p>
        ReplayGain keeps your library at an even volume, so a quiet old record and a loud new
        master play at about the same level. Oscine uses the values your files already carry, by
        track or by album, and it can measure the ones that are missing right on your computer.
      </p>
      <p class="mt-4">
        Start a measurement from Settings, the command palette, or by right-clicking an album or a
        few tracks. After a library scan, Oscine lets you know when tracks are missing values and
        offers to measure them.
      </p>
      <p class="mt-4">
        Measured values wait in the Tools tab with the rest of your staged tag changes, next to
        whatever each file has now and labeled with where each number came from.
      </p>
    </template>
  </UPageSection>
</template>
