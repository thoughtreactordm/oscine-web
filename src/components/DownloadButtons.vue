<script setup lang="ts">
import type { Release } from '../data/release'

defineProps<{
  release: Release
  size?: 'lg' | 'md'
}>()
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
    <UButton
      v-if="release.windows"
      :href="release.windows"
      color="primary"
      :size="size ?? 'lg'"
      icon="i-tabler-brand-windows"
      trailing-icon="i-tabler-download"
    >
      Windows installer
    </UButton>
    <UButton
      v-if="release.appImage"
      :href="release.appImage"
      color="neutral"
      variant="subtle"
      :size="size ?? 'lg'"
      icon="i-tabler-terminal-2"
      trailing-icon="i-tabler-download"
    >
      Linux AppImage
    </UButton>
    <UButton
      v-if="release.deb"
      :href="release.deb"
      color="neutral"
      variant="ghost"
      :size="size ?? 'lg'"
      icon="i-tabler-package"
    >
      .deb
    </UButton>
  </div>
</template>
