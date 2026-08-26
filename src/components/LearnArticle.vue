<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { computed } from 'vue'

export interface LearnNavPage {
  id: string
  title: string
}

const props = defineProps<{
  currentId: string
  title: string
  description: string
  section: string
  pages: LearnNavPage[]
}>()

const items = computed<NavigationMenuItem[]>(() => [
  { label: 'Overview', to: '/learn' },
  ...props.pages.map((page) => ({
    label: page.title,
    to: `/learn/${page.id}`,
    active: page.id === props.currentId
  }))
])
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <UNavigationMenu orientation="vertical" highlight :items="items" />
        </UPageAside>
      </template>

      <UPageHeader :headline="section" :title="title" :description="description" />

      <UPageBody>
        <div class="doc-body">
          <slot />
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
