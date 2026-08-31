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
      "Yes. Oscine is free to download and use on both Windows and Linux, and the source is available under the MIT license. No account, no subscription, no upsell.",
  },
  {
    label: "Does Oscine stream music or host a catalog?",
    content:
      "No. Oscine plays the music you already own — the files on your own drive. It builds a rich data layer around your collection so it feels as good to browse as any streaming app, but everything stays local to you.",
  },
  {
    label: "Which file formats does Oscine support?",
    content:
      "Oscine handles the formats you'd expect from a local library — FLAC, MP3, AAC/M4A, OGG, and WAV among them. Point it at your music folder and it takes care of the rest.",
  },
  {
    label: "What is the Tunedeck?",
    content:
      "The Tunedeck is a sidekick panel that surfaces contextual details about whatever you're playing — the story behind the track and artist, without pulling you out of your library.",
  },
  {
    label: "Can I make it look the way I want?",
    content:
      "That's the whole idea. Themes and style customization let you tune the look and feel of the player, and Oscine checks color combinations against WCAG 2.1 AA contrast guidance so your choices stay readable.",
  },
  {
    label: "Is there a macOS version?",
    content:
      "Not yet. Oscine ships for Windows and Linux today. macOS isn't available right now, but it's on our radar.",
  },
];
</script>

<template>
  <UAccordion :items="faqs" />
</template>
