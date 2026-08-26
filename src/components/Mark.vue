<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: string
  }>(),
  { size: 'size-8' }
)
</script>

<template>
  <span
    :class="['inline-flex items-center justify-center rounded-lg bg-primary text-inverted', size]"
    aria-hidden="true"
  >
    <UIcon name="i-tabler-wave-sine" class="size-[62%]" />
  </span>
</template>
