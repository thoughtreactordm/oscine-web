<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";

/**
 * The FAQ list for the home page. Lives as its own island because an accordion
 * needs JS to expand — the rest of HomeLanding is static SSR, so this is passed
 * in through the `faqs` slot with a `client:*` directive, the same way the hero
 * byline is.
 */
const faqs: AccordionItem[] = [
  {
    label: "Is Oscine free?",
    content:
      "Yes. Oscine is free to download and use on both Windows and Linux, and the source is available under the MIT license.",
  },
  {
    label: "Does Oscine stream music or host a catalog?",
    content:
      "No. Oscine plays the local music you already own. It builds a rich data layer around your collection so it feels as good to browse as any streaming app, but everything stays local to you.",
  },
  {
    label: "Which file formats does Oscine support?",
    content:
      "Oscine handles the formats you'd expect from a local library: FLAC, MP3, AAC/M4A, OGG, and WAV among them. Point it at your music folder and it takes care of the rest.",
  },
  {
    label: "Can I make it look the way I want?",
    content:
      "Themes and style customization let you tune the look and feel of the player, and Oscine checks color combinations against WCAG 2.1 AA contrast guidance so your choices stay readable.",
  },
  {
    label: "Does Oscine use AI or have an AI disclosure?",
    content:
      "The software application is developed with the assistance of agentic/AI coding tools to aid in speed of development or solve pressing issues. Oscine does not currently include support for any AI or LLM technologies and does not support the generation of music, art, and literature using these tools. For more information about how the developer uses these tools, please view our <a href='/disclosure' class='text-primary underline'>AI Disclosure</a> page.",
  },
  {
    label: "Is there a macOS version?",
    content:
      "Not yet. Oscine ships for Windows and Linux today. macOS isn't available right now, but it's on our radar.",
  },
];
</script>

<template>
  <section class="max-w-128 mx-auto">
    <UAccordion :items="faqs" :ui="{ trailingIcon: 'text-primary' }">
      <template #body="{ item }"> <p v-html="item.content" /> </template>
    </UAccordion>
  </section>
</template>
