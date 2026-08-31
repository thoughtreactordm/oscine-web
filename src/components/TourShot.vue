<script setup lang="ts">
import ShotFrame from './ShotFrame.vue'

export interface TourShotAsset {
  src: string
  srcSet: string
  avifSrcSet: string
  /** Inlined 32px WebP from `bloom()`, painted behind the frame. */
  bloom: string
  width: number
  height: number
}

withDefaults(
  defineProps<{
    shot: TourShotAsset
    alt: string
    sizes?: string
    loading?: 'eager' | 'lazy'
    variant?: 'window' | 'natural'
    frame?: string
  }>(),
  {
    sizes: '(min-width: 1024px) 36rem, 100vw',
    loading: 'lazy',
    variant: 'window',
    frame: 'shadow-xl shadow-black/40'
  }
)
</script>

<template>
  <ShotFrame :bloom="shot.bloom" :alt="alt" :aspect="variant === 'window'" :frame="frame">
    <picture :class="variant === 'window' ? 'block size-full' : 'block w-full'">
      <source :srcset="shot.avifSrcSet" type="image/avif" :sizes="sizes" />
      <source :srcset="shot.srcSet" type="image/webp" :sizes="sizes" />
      <img
        :src="shot.src"
        :alt="alt"
        :width="shot.width"
        :height="shot.height"
        :sizes="sizes"
        :loading="loading"
        decoding="async"
        :class="variant === 'window' ? 'size-full object-cover object-top' : 'h-auto w-full'"
      />
    </picture>
  </ShotFrame>
</template>
