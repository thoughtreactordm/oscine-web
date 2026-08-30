<script setup lang="ts">
export interface TourShotAsset {
  src: string
  srcSet: string
  avifSrcSet: string
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
  }>(),
  {
    sizes: '(min-width: 1024px) 36rem, 100vw',
    loading: 'lazy',
    variant: 'window'
  }
)
</script>

<template>
  <div
    class="min-w-0 overflow-hidden rounded-xl bg-elevated ring ring-default shadow-xl shadow-black/30"
    :class="variant === 'window' ? 'aspect-[1280/820]' : ''"
  >
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
        :class="
          variant === 'window' ? 'size-full object-cover object-top' : 'h-auto w-full'
        "
      />
    </picture>
  </div>
</template>
