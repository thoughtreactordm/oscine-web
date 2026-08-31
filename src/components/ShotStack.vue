<script setup lang="ts">
/**
 * Two shots as one composition instead of two rows: the second sits over the
 * first's bottom-right corner, hanging off the edge. Below `sm` it unstacks to
 * plain rows, where there is no width to spend on overlap.
 *
 * `pad` reserves the room the absolutely-positioned overlay needs, so it is
 * tied to the overlay's width and aspect — tune the two together.
 */
withDefaults(
  defineProps<{
    pad?: string
    base?: string
    overlay?: string
  }>(),
  {
    pad: 'sm:pb-[13%]',
    base: 'sm:w-[86%]',
    overlay: 'sm:absolute sm:bottom-0 sm:right-0 sm:w-[54%]'
  }
)
</script>

<template>
  <div class="relative min-w-0" :class="pad">
    <div class="min-w-0" :class="base">
      <slot name="base" />
    </div>
    <div class="mt-4 min-w-0 sm:mt-0" :class="overlay">
      <slot name="overlay" />
    </div>
  </div>
</template>
