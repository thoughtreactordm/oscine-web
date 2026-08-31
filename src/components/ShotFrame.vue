<script setup lang="ts">
/**
 * The window frame every screenshot sits in: an ambient bloom of the shot's own
 * colors behind it, and a click target that hands the picture to Lightbox.vue.
 *
 * Rendered statically. The zoom is wired up by the Lightbox island, which
 * delegates from the document and reads the `<picture>` inside `[data-zoom]`.
 */
withDefaults(
  defineProps<{
    /** Inlined 32px WebP from `bloom()`. Omit for no wash. */
    bloom?: string
    alt?: string
    /** Crop to the app window's ratio instead of letting the image set the height. */
    aspect?: boolean
    zoom?: boolean
    /** Replaces the default elevation, for shots that need to read as lifted. */
    frame?: string
  }>(),
  {
    bloom: '',
    alt: '',
    aspect: false,
    zoom: true,
    frame: 'shadow-xl shadow-black/40'
  }
)
</script>

<template>
  <div class="group relative isolate min-w-0">
    <div
      v-if="bloom"
      class="shot-bloom"
      :style="{ backgroundImage: `url('${bloom}')` }"
      aria-hidden="true"
    />

    <component
      :is="zoom ? 'button' : 'div'"
      :type="zoom ? 'button' : undefined"
      :data-zoom="zoom ? '' : undefined"
      :data-bloom="zoom && bloom ? bloom : undefined"
      :aria-label="zoom && alt ? `Zoom: ${alt}` : undefined"
      class="shot-frame relative z-10 block w-full min-w-0 overflow-hidden rounded-xl bg-elevated text-left ring ring-default transition duration-300 ease-out"
      :class="[
        frame,
        aspect ? 'aspect-[1280/820]' : '',
        zoom
          ? 'cursor-zoom-in group-hover:-translate-y-0.5 group-hover:ring-primary/35 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'
          : ''
      ]"
    >
      <slot />
      <span v-if="zoom" class="shot-zoom">
        <UIcon name="i-tabler-arrows-diagonal" class="size-4" />
      </span>
    </component>
  </div>
</template>
