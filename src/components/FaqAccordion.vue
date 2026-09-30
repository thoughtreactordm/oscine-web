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
      "Yes. Oscine is free on Windows and Linux, and the source code is on GitHub under the MIT license.",
  },
  {
    label: "Does Oscine stream music or host a catalog?",
    content:
      "No. Oscine plays the music you already own, right from the folders on your own drives. It builds a rich data layer around your collection so browsing it feels as good as any streaming app, and all of it stays on your machine.",
  },
  {
    label: "Which file formats does Oscine support?",
    content:
      "FLAC, MP3, AAC/M4A, Ogg Vorbis, Opus, and WAV. Point Oscine at your music folders and it takes it from there. CDs you rip in the app are saved as FLAC.",
  },
  {
    label: "Can I make it look the way I want?",
    content:
      "Yes. Pick from three themes, each with a light and dark variant, then fine-tune color, type, and motion in the theme editor. Oscine checks your color combinations against WCAG 2.1 AA contrast guidance so everything stays readable.",
  },
  {
    label: "Can I rip CDs with Oscine?",
    content:
      "Yes, as of 1.1. Pop a disc in, open Rip CD in the Tools tab, and Oscine matches it on MusicBrainz, grabs the cover art, and saves each track to your library as FLAC.",
  },
  {
    label: "Does Oscine use AI or have an AI disclosure?",
    content:
      "The software application is developed with the assistance of agentic/AI coding tools to aid in speed of development or solve pressing issues. Oscine does not currently include support for any AI or LLM technologies and does not support the generation of music, art, and literature using these tools. For more information about how the developer uses these tools, please view our <a href='/disclosure' class='text-primary underline'>AI Disclosure</a> page.",
  },
  {
    label: "Is there a macOS version?",
    content:
      "Not yet. Oscine is available for Windows and Linux today, and macOS is on the radar.",
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
