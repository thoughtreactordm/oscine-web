<script setup lang="ts">
import { centeredUi } from "./tour";
</script>

<!--
  Kept small on purpose: agent access is not a headline. Gating: document the
  Claude Code path until W24-11 verifies Windows and Claude Desktop. Required:
  what the agent reads goes to its AI service (listening history included), and
  nothing reaches files until Apply. No promises about prompt injection.
-->
<template>
  <UPageSection id="agent-access" title="Agent access" class="section-rule" :ui="centeredUi">
    <template #description>
      <p>
        Oscine has no AI built in. If you already use an agent like Claude Code, you can turn on a
        local connection in Settings and let it work with your library, like building playlists or
        suggesting tag fixes. It's off by default, it only listens on your own computer, and each
        kind of access has its own switch.
      </p>
      <p class="mt-4">
        Whatever the agent reads, including your listening history, goes to the AI service it runs
        on. Tag changes it suggests wait in the Tools tab with everything else, and nothing reaches
        your files until you click Apply.
      </p>
    </template>
  </UPageSection>
</template>
