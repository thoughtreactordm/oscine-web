<script setup lang="ts">
const services = [
  { label: "Last.fm", icon: "i-tabler-brand-lastfm" },
  { label: "ListenBrainz", icon: "i-tabler-brain" },
  { label: "Discord", icon: "i-tabler-brand-discord" },
];
</script>

<template>
  <UPageSection id="scrobbling" title="Scrobbling & Discord" class="section-rule">
    <template #description>
      <div class="flex flex-wrap gap-3 justify-center items-center">
        <span
          v-for="service in services"
          :key="service.label"
          class="inline-flex items-center gap-2.5 rounded-xl border border-default bg-elevated/60 px-4 py-2.5 text-highlighted"
        >
          <UIcon :name="service.icon" class="size-7 text-primary" />
          {{ service.label }}
        </span>
      </div>
      <p class="mt-4">
        Choose one or both scrobbling services. Oscine will keep track offline and update once
        connected to the net.
      </p>
      <p class="mt-2">
        Discord presence shows what you're listening to on your profile, with the album
        art and a status line you can word however you like.
      </p>
    </template>
  </UPageSection>
</template>
