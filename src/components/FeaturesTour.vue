<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";
import type { Release } from "../data/release";
import { SHOT_ALTS } from "../data/learn-shots";
import DownloadButtons from "./DownloadButtons.vue";
import ShotStack from "./ShotStack.vue";
import TourShot, { type TourShotAsset } from "./TourShot.vue";

defineProps<{
  release: Release;
  shots: {
    libraryHero: TourShotAsset;
    columnChooser: TourShotAsset;
    tunedeckArtist: TourShotAsset;
    tunedeckRelated: TourShotAsset;
    themeOscineDark: TourShotAsset;
    themeOscineLight: TourShotAsset;
    themeNocturne: TourShotAsset;
    themeEditor: TourShotAsset;
    curateDiscover: TourShotAsset;
    stage: TourShotAsset;
    zen: TourShotAsset;
    trackInfo: TourShotAsset;
    stats: TourShotAsset;
    podcasts: TourShotAsset;
    toolsWriteback: TourShotAsset;
    palette: TourShotAsset;
    quickMenu: TourShotAsset;
  };
}>();

const alignStart = {
  title: "text-left",
  description: "text-left",
  headline: "justify-start",
  leading: "justify-start",
  links: "justify-start",
};

/** Section headings carry the accent; the page header title stays plain. */
const sectionUi = { ...alignStart, title: "text-left section-title" };

const heroLinks: ButtonProps[] = [
  { label: "Download", to: "/download", color: "primary" },
  {
    label: "Learn",
    to: "/learn",
    color: "neutral",
    variant: "subtle",
  },
];

/** The shot behind an overlay is narrower than the column, so it asks for less. */
const stacked = "(min-width: 1024px) 31rem, 100vw";
const inset = "(min-width: 1024px) 20rem, 100vw";
const half = "(min-width: 1024px) 36rem, 100vw";
const trio = "(min-width: 640px) 22rem, 100vw";
const full = "(min-width: 80rem) 72rem, 100vw";

/** Overlays sit on top of another shot and need to read that way. */
const lifted = "shadow-2xl shadow-black/70";
</script>

<template>
  <div class="relative isolate">
    <div class="amber-glow amber-glow--top" aria-hidden="true" />
    <UContainer>
      <UPageHeader
        headline="Features"
        title="Every surface."
        description="A (non-exhaustive) look at what you can do with your music using Oscine."
        :links="heroLinks"
      />
    </UContainer>
  </div>

  <UPageSection title="Library" orientation="horizontal" class="section-rule" :ui="sectionUi">
    <template #description>
      <p>
        Like any local music player, the app's experience is driven by the music library you've
        cultivated. Add any number of folders to watch, browse them together or individually, and
        search amongst them using an instant search function.
      </p>
      <p class="mt-4">
        With source lists breaking tracks down by Genre/Tag, Artists, and Albums you can quickly
        scour through your collection and find just the right tunes to queue up.
      </p>
      <p class="mt-4">
        With the <strong>Songs</strong> list, take full control over which data columns you want to
        display, sort by, their position in the table, and more.
      </p>
    </template>

    <!-- The column strip is a detail of the window it sits on, so it rides the edge. -->
    <ShotStack pad="sm:pb-5" base="sm:w-full" overlay="sm:absolute sm:-inset-x-4 sm:bottom-0">
      <template #base>
        <TourShot
          :shot="shots.libraryHero"
          :alt="SHOT_ALTS['library-hero']"
          :sizes="half"
          loading="eager"
        />
      </template>
      <!--<template #overlay>
        <TourShot
          :shot="shots.columnChooser"
          :alt="SHOT_ALTS['column-chooser']"
          :sizes="half"
          variant="natural"
          :frame="lifted"
        />
      </template>-->
    </ShotStack>
  </UPageSection>

  <UPageSection
    title="Tunedeck"
    orientation="horizontal"
    reverse
    class="section-rule bg-elevated/40"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        A drawer on the right that stays open while you browse. Four tabs: Artist, Track, Related,
        and Playing. Related is the rest of the album, then looser matches on genre, year, or
        folder, all from your library.
      </p>
      <p class="mt-4">
        Turn on online lookups and it adds a biography and line-ups; leave them off and everything
        local still works.
      </p>
    </template>

    <ShotStack>
      <template #base>
        <TourShot
          :shot="shots.tunedeckArtist"
          :alt="SHOT_ALTS['tunedeck-artist']"
          :sizes="stacked"
        />
      </template>
      <template #overlay>
        <TourShot
          :shot="shots.tunedeckRelated"
          :alt="SHOT_ALTS['tunedeck-related']"
          :sizes="inset"
          :frame="lifted"
        />
      </template>
    </ShotStack>
  </UPageSection>

  <UPageSection title="Themes" class="section-rule" :ui="{ ...sectionUi, body: 'mt-8' }">
    <template #description>
      <p>
        Three themes, each in light and dark: Oscine, Nocturne, and High Contrast. The token editor
        covers color, type, and motion, and a contrast warning sits on the row that caused it.
      </p>
      <p class="mt-4">
        The accent can follow the current cover. An accent you set in the editor still wins.
      </p>
    </template>

    <template #body>
      <!-- Fanned rather than flush: three windows in a row is the flattest thing on the page. -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        <figure class="min-w-0 sm:mt-8">
          <TourShot
            :shot="shots.themeOscineDark"
            :alt="SHOT_ALTS['theme-oscine-dark']"
            :sizes="trio"
          />
          <figcaption class="mt-2.5 text-sm text-muted">Oscine dark</figcaption>
        </figure>
        <figure class="min-w-0">
          <TourShot
            :shot="shots.themeOscineLight"
            :alt="SHOT_ALTS['theme-oscine-light']"
            :sizes="trio"
          />
          <figcaption class="mt-2.5 text-sm text-muted">Oscine light</figcaption>
        </figure>
        <figure class="min-w-0 sm:mt-8">
          <TourShot :shot="shots.themeNocturne" :alt="SHOT_ALTS['theme-nocturne']" :sizes="trio" />
          <figcaption class="mt-2.5 text-sm text-muted">Nocturne</figcaption>
        </figure>
      </div>
      <div class="mt-8">
        <TourShot :shot="shots.themeEditor" :alt="SHOT_ALTS['theme-editor']" :sizes="full" />
      </div>
    </template>
  </UPageSection>

  <UPageSection
    title="Curate & Discover"
    orientation="horizontal"
    class="section-rule bg-elevated/40"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Playlists live on a rail, with My Favorites at the top. Export to .m3u8 when you need the
        list somewhere else. The queue is two layers: tracks you queued by hand sit above the rest
        of the session. Shuffle reorders the session and leaves those hand-queued tracks alone.
      </p>
      <p class="mt-4">
        Discover is nine recipes over your files and your listening log. Sitting unplayed, Forgotten
        favorites, and Almost finished are three of them. Every card has a one-line reason, and a
        shelf becomes a playlist when you save it.
      </p>
    </template>

    <TourShot :shot="shots.curateDiscover" :alt="SHOT_ALTS['curate-discover']" :sizes="half" />
  </UPageSection>

  <UPageSection
    title="Stage & Zen"
    orientation="horizontal"
    reverse
    class="section-rule"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        The Stage is Now Playing at full window: the cover, a waveform ribbon, and the track you are
        hearing.
      </p>
      <p class="mt-4">
        Zen drops the title bar, the tabs, and the transport chrome and goes fullscreen. It is for a
        TV or a second screen.
      </p>
    </template>

    <ShotStack>
      <template #base>
        <TourShot :shot="shots.stage" :alt="SHOT_ALTS.stage" :sizes="stacked" />
      </template>
      <template #overlay>
        <TourShot :shot="shots.zen" :alt="SHOT_ALTS.zen" :sizes="inset" :frame="lifted" />
      </template>
    </ShotStack>
  </UPageSection>

  <UPageSection
    title="Playback"
    orientation="horizontal"
    class="section-rule bg-elevated/40"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Gapless is the default. A crossfade duration of zero is gapless; raise it and you get a fade
        at the boundary.
      </p>
      <p class="mt-4">
        ReplayGain comes from tags when they exist. Untagged tracks can be measured in the
        background. Oscine plays FLAC, MP3, Ogg Vorbis, Opus, AAC, and WAV.
      </p>
    </template>

    <TourShot
      :shot="shots.trackInfo"
      :alt="SHOT_ALTS['track-info']"
      :sizes="half"
      variant="natural"
    />
  </UPageSection>

  <UPageSection title="Stats" orientation="horizontal" reverse class="section-rule" :ui="sectionUi">
    <template #description>
      <p>
        Stats is the listening log: top artists, albums, and tracks for a range you pick. Totals
        follow the tags as they were when you listened, so a later rename or a folder reorganize
        does not rewrite last year. Favorites are local.
      </p>
    </template>

    <TourShot :shot="shots.stats" :alt="SHOT_ALTS.stats" :sizes="half" />
  </UPageSection>

  <UPageSection
    title="Podcasts"
    orientation="horizontal"
    class="section-rule bg-elevated/40"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Subscribe, download, then play. Shows stay on their own tab. Episodes are not mixed into the
        music library, search, or ReplayGain.
      </p>
    </template>

    <TourShot :shot="shots.podcasts" :alt="SHOT_ALTS.podcasts" :sizes="half" />
  </UPageSection>

  <UPageSection title="Tools" orientation="horizontal" reverse class="section-rule" :ui="sectionUi">
    <template #description>
      <p>
        Tag edits are staged. You review the before and after, then write. A backup of the original
        sits beside the file until the write stands.
      </p>
    </template>

    <TourShot :shot="shots.toolsWriteback" :alt="SHOT_ALTS['tools-writeback']" :sizes="half" />
  </UPageSection>

  <UPageSection
    title="Quick access"
    orientation="horizontal"
    class="section-rule bg-elevated/40"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        <UKbd>Ctrl</UKbd>
        <UKbd class="ml-1">K</UKbd>
        opens the command palette from anywhere. Prefixes narrow it:
        <code class="text-primary">&gt;</code>
        for actions,
        <code class="text-primary">@</code>
        for artists,
        <code class="text-primary">#</code>
        for playlists,
        <code class="text-primary">/</code>
        for settings.
      </p>
      <p class="mt-4">
        The Quick Menu on Now Playing holds favorite playlists, recent additions, and favorite
        artists. Playback and navigation have a fixed set of global shortcuts.
      </p>
    </template>

    <ShotStack>
      <template #base>
        <TourShot :shot="shots.palette" :alt="SHOT_ALTS.palette" :sizes="stacked" />
      </template>
      <template #overlay>
        <TourShot
          :shot="shots.quickMenu"
          :alt="SHOT_ALTS['quick-menu']"
          :sizes="inset"
          :frame="lifted"
        />
      </template>
    </ShotStack>
  </UPageSection>

  <UPageSection title="Scrobbling" class="section-rule">
    <template #description>
      <div class="flex flex-wrap gap-3 justify-center items-center">
        <span
          class="inline-flex items-center gap-2.5 rounded-xl border border-default bg-elevated/60 px-4 py-2.5 text-highlighted"
        >
          <UIcon name="i-tabler-brand-lastfm" class="size-7 text-primary" />
          Last.fm
        </span>
        <span
          class="inline-flex items-center gap-2.5 rounded-xl border border-default bg-elevated/60 px-4 py-2.5 text-highlighted"
        >
          <UIcon name="i-tabler-brain" class="size-7 text-primary" />
          ListenBrainz
        </span>
      </div>
      <p class="mt-4">
        Choose one or both services. Oscine will keep track offline and update once connected to the
        net.
      </p>
    </template>
  </UPageSection>

  <div class="relative isolate">
    <div class="amber-glow amber-glow--bottom" aria-hidden="true" />
    <UPageCTA
      variant="naked"
      class="section-rule rounded-none"
      title="Get Oscine."
      description="Free for Windows and Linux."
    >
      <template #body> <DownloadButtons :release="release" /> </template>
      <template #footer>
        <p class="text-sm text-dimmed text-center"><ULink to="/download">All downloads</ULink></p>
      </template>
    </UPageCTA>
  </div>
</template>
