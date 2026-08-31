<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

/**
 * One island per page, mounted by BaseLayout when `zoom` is set. It listens on
 * the document rather than owning any markup, so the pages themselves stay
 * static HTML: anything with `[data-zoom]` around a `<picture>` becomes
 * clickable, including shots rendered by Astro components.
 *
 * A native <dialog> gives us the top layer, focus trapping, and Escape for
 * free — no need to reimplement any of it.
 */

interface ZoomSource {
  srcset: string
  type: string
}

const dialog = ref<HTMLDialogElement | null>(null)
const sources = shallowRef<ZoomSource[]>([])
const src = ref('')
const alt = ref('')
const bloom = ref('')

/** The zoomed shot fills most of the viewport, whichever axis binds first. */
const SIZES = '(min-aspect-ratio: 3/2) 84vh, 92vw'

function onClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return
  if (dialog.value?.open) return

  const target = event.target as Element | null
  const trigger = target?.closest?.('[data-zoom]')
  if (!trigger) return

  const img = trigger.querySelector('img')
  if (!img) return

  event.preventDefault()
  sources.value = Array.from(trigger.querySelectorAll('source')).map((source) => ({
    srcset: source.srcset,
    type: source.type
  }))
  src.value = img.currentSrc || img.src
  alt.value = img.alt
  bloom.value = trigger.getAttribute('data-bloom') ?? ''

  document.documentElement.classList.add('lightbox-open')
  dialog.value?.showModal()
}

function close() {
  dialog.value?.close()
}

function onClose() {
  document.documentElement.classList.remove('lightbox-open')
}

/** The panel fills the dialog, so anything outside the shot itself is a dismiss. */
function onDialogClick(event: MouseEvent) {
  const el = event.target as Element | null
  if (el?.closest('.lightbox__img, .lightbox__caption')) return
  close()
}

onMounted(() => document.addEventListener('click', onClick))
onBeforeUnmount(() => {
  document.removeEventListener('click', onClick)
  onClose()
})
</script>

<template>
  <dialog ref="dialog" class="lightbox" @close="onClose" @click="onDialogClick">
    <div class="lightbox__panel">
      <div
        v-if="bloom"
        class="lightbox__bloom"
        :style="{ backgroundImage: `url('${bloom}')` }"
        aria-hidden="true"
      />
      <picture class="lightbox__picture">
        <source
          v-for="source in sources"
          :key="source.type"
          :srcset="source.srcset"
          :type="source.type"
          :sizes="SIZES"
        />
        <img :src="src" :alt="alt" :sizes="SIZES" class="lightbox__img" />
      </picture>
      <p class="lightbox__caption" aria-hidden="true">{{ alt }}</p>
      <button type="button" class="lightbox__close" aria-label="Close" @click="close">
        <UIcon name="i-lucide-x" class="size-5" />
      </button>
    </div>
  </dialog>
</template>
