<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { computed } from 'vue'
import Mark from './Mark.vue'

const props = defineProps<{
  currentPath: string
}>()

function active(href: string) {
  if (href === '/') return props.currentPath === '/'
  return props.currentPath === href || props.currentPath.startsWith(`${href}/`)
}

const items = computed<NavigationMenuItem[]>(() => [
  { label: 'Features', to: '/features', active: active('/features') },
  { label: 'Learn', to: '/learn', active: active('/learn') },
  { label: 'Download', to: '/download', active: active('/download') }
])
</script>

<template>
  <UHeader title="Oscine" to="/" :ui="{ title: 'flex items-center gap-2.5 font-normal text-lg' }">
    <template #title>
      <Mark />
      <span class="wordmark text-highlighted">oscine</span>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UButton to="/download" color="primary" size="sm" class="hidden lg:inline-flex">
        Get Oscine
      </UButton>
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
      <UButton to="/download" color="primary" block class="mt-4">Get Oscine</UButton>
    </template>
  </UHeader>
</template>
