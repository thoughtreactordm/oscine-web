<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import { FEATURE_TABS, featureTabHref } from "../../data/features";

const props = defineProps<{ active: string }>();

/** Real links, one route per tab, so the back button and search both see them. */
const items: NavigationMenuItem[] = FEATURE_TABS.map((tab) => ({
  label: tab.label,
  to: featureTabHref(tab),
  active: tab.slug === props.active,
}));
</script>

<template>
  <!--
    Sticks under the site header. On a phone the five tabs are wider than the
    screen, so the strip scrolls sideways instead of wrapping.
  -->
  <nav
    aria-label="Features"
    class="sticky top-(--ui-header-height) z-40 border-b border-default bg-default/75 backdrop-blur"
  >
    <UContainer data-feature-tabs class="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <UNavigationMenu
        :items="items"
        highlight
        highlight-color="primary"
        color="neutral"
        :ui="{
          root: 'h-(--feature-tabs-height) w-max min-w-full',
          list: 'gap-1',
          link: 'whitespace-nowrap px-3 py-3 after:-bottom-px after:inset-x-3 after:h-0.5',
        }"
      />
    </UContainer>
  </nav>
</template>
