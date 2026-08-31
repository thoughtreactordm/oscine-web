<script setup lang="ts">
import { computed } from "vue";
import { downloadTargets, type Release } from "../data/release";

const props = defineProps<{
  release: Release;
  size?: "lg" | "md";
}>();

const targets = computed(() => downloadTargets(props.release));
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap justify-center items-center">
    <UButton
      v-for="target in targets"
      :key="target.id"
      :href="target.asset.url"
      :color="target.color"
      :variant="target.variant"
      :size="size ?? 'lg'"
      :icon="target.icon"
      trailing-icon="i-tabler-download"
    >
      {{ target.label }}
    </UButton>
  </div>
</template>
