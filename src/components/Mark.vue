<script setup lang="ts">
import { computed } from "vue";
/*
 * The Oscine mark: a songbird traced by a sound wave, on a filled disc.
 *
 * Same two paths the app draws in `src/renderer/shell/AppLogo.vue` and
 * rasterises for its icon set — the design source is the app's
 * `build/oscine-logo.svg`. Inlined here rather than referenced as a file so the
 * disc takes `--ui-primary` and the wave `--ui-text-inverted`, exactly as the
 * app themes it. The disc fills the square, so the mark is a full circle at any
 * size; size it from the outside with the `size` prop.
 *
 * The fills live in `styles/global.css`, not a scoped block: Astro ships an
 * island's scoped styles inside its JS chunk, which left the mark black until
 * the header hydrated.
 */
const { dimmed = false, size = "size-8" } = defineProps<{
  size?: string;
  dimmed?: boolean;
}>();
const discClass = computed(() => {
  return dimmed ? "oscine-mark__dimmed" : "oscine-mark__disc";
});
</script>

<template>
  <svg
    :class="['oscine-mark inline-block shrink-0', size]"
    viewBox="0 0 1354.467 1354.467"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle :class="discClass" cx="677.2335" cy="677.2335" r="677.2335" />
    <g transform="translate(-598.58913,-19.030152)">
      <path
        class="oscine-mark__wave"
        d="M 1271.0557,1308.4772 C 741.17898,1300.5229 660.50918,836.35762 659.88847,671.06575 679.01264,242.13636 1006.5391,79.342604 1297.8645,80.320666 c 287.8771,1.999713 578.1381,285.266774 585.0415,599.231634 1.8271,83.09344 -87.4357,74.08921 -135.9221,73.67694 C 1625.0317,752.1923 1564.8036,520.11148 1496.6137,490.707 1394.7409,446.77798 1408.915,995.74836 1276.2005,995.36418 1136.1883,994.95891 1197.1081,757.53559 1112.1331,709.26659 1042.6225,680.78906 895.63262,722.65572 896.55917,653.7796 c 1.32376,-98.40319 168.87113,-35.26362 270.89343,-17.69712 82.2508,14.16219 32.5252,226.31273 107.4051,226.17704 84.8037,-0.15367 34.7098,-281.18693 153.7278,-443.05095 143.6896,-195.41712 211.2257,262.43113 334.0382,256.85152 120.8637,-4.07975 12.4601,-172.84518 -32.3796,-239.95212 -93.2309,-139.52905 -235.7971,-238.9368 -435.17,-253.12107 -653.94281,43.98741 -603.58575,1020.6215 -11.5658,1029.8941 329.8012,5.1655 424.3939,-224.53758 514.5889,-380.86778 20.7702,-35.99999 73.678,-65.17349 67.0985,7.83207 -15.4265,171.17161 -201.7082,474.52301 -594.14,468.63191 z"
      />
    </g>
  </svg>
</template>
