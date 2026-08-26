<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import Mark from './Mark.vue'

const year = new Date().getFullYear()

const items: NavigationMenuItem[] = [
  { label: 'Download', to: '/download' },
  { label: 'Learn', to: '/learn' },
  {
    label: 'GitHub',
    to: 'https://github.com/thoughtreactordm/oscine',
    target: '_blank'
  }
]
</script>

<template>
  <UFooter>
    <template #left>
      <div class="flex flex-col gap-2">
        <ULink to="/" raw class="flex items-center gap-2 no-underline">
          <Mark size="size-7" />
          <span class="wordmark text-highlighted">oscine</span>
        </ULink>
        <p class="max-w-sm text-sm text-muted">
          A local music player for Windows and Linux. Free, no account, files you already own.
        </p>
      </div>
    </template>

    <UNavigationMenu :items="items" variant="link" />

    <template #right>
      <p class="text-sm text-muted">Created with love by Michael DeLally · {{ year }}</p>
    </template>
  </UFooter>
</template>
