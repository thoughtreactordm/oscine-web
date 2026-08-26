<script setup lang="ts">
export interface LearnIndexPage {
  id: string
  title: string
  description: string
  section: string
}

defineProps<{
  pages: LearnIndexPage[]
}>()
</script>

<template>
  <UContainer>
    <UPageHeader
      headline="Learn"
      title="How Oscine works"
      description="Enough to get a library playing, then the surfaces that make Oscine yours — Tunedeck, themes, Discover, the palette."
    />

    <UPageBody>
      <UPageGrid class="lg:grid-cols-2">
        <UPageCard
          v-for="page in pages"
          :key="page.id"
          :to="`/learn/${page.id}`"
          :title="page.title"
          :description="page.description"
          variant="subtle"
        >
          <template #header>
            <p class="text-xs font-medium uppercase tracking-wider text-dimmed">{{ page.section }}</p>
          </template>
        </UPageCard>
      </UPageGrid>
    </UPageBody>
  </UContainer>
</template>
