<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import Mark from './Mark.vue'

const year = new Date().getFullYear()

const items: NavigationMenuItem[] = [
  { label: 'Features', to: '/features' },
  { label: 'Learn', to: '/learn' },
  { label: 'Download', to: '/download' },
  { label: 'Changelog', to: '/changelog' },
  {
    label: 'Source',
    to: 'https://github.com/thoughtreactordm/oscine',
    target: '_blank'
  },
  {
    label: 'Issues',
    to: 'https://github.com/thoughtreactordm/oscine/issues',
    target: '_blank'
  }
]
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
        <p class="max-w-sm text-sm text-muted">
          A local music player with real control and an interface from this decade.
        </p>
        <p class="text-xs text-muted">Open source, MIT.</p>
      </div>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
      :ui="{ list: 'flex flex-wrap items-center justify-center' }"
    />

    <template #right>
      <p class="text-sm text-muted">Created with love by Michael DeLally · {{ year }}</p>
    </template>
  </UFooter>
</template>
