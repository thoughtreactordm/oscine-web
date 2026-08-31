<script setup lang="ts">
/**
 * The rotating half of the hero's second line: a crossfading word cycled on a
 * timer beneath "Oscine is", on its own centered line. Because the word sits on
 * its own line, its width can change as words swap without reflowing anything
 * above it — so no width-holding sizer is needed. The full list is read once to
 * assistive tech.
 */
import { onMounted, onUnmounted, ref } from "vue";

/** Short and sweet — one claim per turn. */
const bylines = [
  "offline & local first",
  "artist-centric",
  "open source",
  "privacy focused",
  "accessible",
  "insanely customizable",
  "for music lovers",
] as const;

const index = ref(0);
let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  timer = setInterval(() => {
    index.value = (index.value + 1) % bylines.length;
  }, 2600);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <span class="hero-byline">
    <Transition name="hero-byline">
      <span :key="bylines[index]" class="hero-byline__word" aria-hidden="true">
        {{ bylines[index] }}
      </span>
    </Transition>

    <span class="sr-only">
      open source, ad-free, privacy first, customizable, and artist-focused.
    </span>
  </span>
</template>

<style scoped>
.hero-byline {
  display: grid;
  justify-items: center;
  color: var(--ui-primary);
  font-weight: 600;
}

/* Leaving and entering words share one grid cell so they crossfade in place;
 * the cell just sizes to whichever is wider mid-swap, and the centered column
 * keeps both centered under "Oscine is" regardless of length. */
.hero-byline__word {
  grid-area: 1 / 1;
}

.hero-byline-enter-active,
.hero-byline-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.hero-byline-enter-from {
  opacity: 0;
  transform: translateY(0.45em);
}

.hero-byline-leave-to {
  opacity: 0;
  transform: translateY(-0.45em);
}

@media (prefers-reduced-motion: reduce) {
  .hero-byline-enter-active,
  .hero-byline-leave-active {
    transition-property: opacity;
  }

  .hero-byline-enter-from,
  .hero-byline-leave-to {
    transform: none;
  }
}
</style>
