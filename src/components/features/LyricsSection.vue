<script setup lang="ts">
import { centeredUi } from "./tour";
</script>

<template>
  <UPageSection id="lyrics" title="Lyrics" class="section-rule" :ui="centeredUi">
    <template #description>
      <p>
        The Stage shows lyrics too, and synced lyrics scroll along with the song. Oscine reads them
        from a .lrc file next to the track or from the file's own tags, and with online lookups on
        it can find them on LRCLIB.
      </p>
    </template>
  </UPageSection>
</template>
