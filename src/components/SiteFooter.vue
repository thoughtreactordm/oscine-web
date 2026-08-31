<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import Mark from "./Mark.vue";

const year = new Date().getFullYear();

const items: NavigationMenuItem[] = [
  // { label: "Features", to: "/features" },
  // { label: "Learn", to: "/learn" },
  // { label: "Download", to: "/download" },
  { label: "Changelog", to: "/changelog" },
  {
    label: "Source",
    to: "https://github.com/thoughtreactordm/oscine",
    target: "_blank",
  },
  {
    label: "Issues",
    to: "https://github.com/thoughtreactordm/oscine/issues",
    target: "_blank",
  },
];
</script>

<template>
  <UFooter
    :ui="{
      container:
        'py-8 lg:py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-x-3',
      left: 'flex items-center justify-center lg:justify-start lg:flex-1 gap-x-1.5 mt-3 lg:mt-0 order-1',
      center: 'mt-3 lg:mt-0 order-2 flex items-center justify-center',
      right:
        'lg:flex-1 flex items-center justify-center lg:justify-end gap-x-1.5 mt-3 lg:mt-0 order-3'
    }"
  >
    <template #left>
      <div class="flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
        <ULink to="/" raw class="flex items-center gap-2 no-underline">
          <Mark size="size-7" />
          <span class="wordmark text-highlighted">oscine</span>
        </ULink>
        <p class="text-xs text-muted max-w-64">
          Future forward & customizeable desktop music player for enthusiasts and collectors.
        </p>
      </div>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
      :ui="{ list: 'flex flex-wrap items-center justify-center' }"
    />

    <template #right>
      <section class="flex flex-col gap-1 text-center lg:text-right text-dimmed text-xs">
        <p>
          Oscine, the <Mark size="size-5" dimmed class="mx-1 mb-1" /> logo &copy;{{ year }}
          Thought Reactor
        </p>
        <p>Created with ❤️ by Michael DeLally</p>
        <p class="text-xs">Sotware code open source, MIT.</p>
      </section>
    </template>
  </UFooter>
</template>
