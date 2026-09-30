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
    tagEditor: TourShotAsset;
    toolsEqualizer: TourShotAsset;
    toolsCdrip: TourShotAsset;
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
    id="equalizer"
    headline="New in 1.1"
    title="Equalizer"
    orientation="horizontal"
    reverse
    class="section-rule bg-elevated/40"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Oscine now has a full parametric equalizer in the Tools tab. Drag bands around right on the
        curve or type exact values into the table below it, with up to twelve bands of peaking,
        shelf, pass, and notch filters. A live spectrum runs behind the curve so you can see what
        you're shaping.
      </p>
      <p class="mt-4">
        Save the curves you like as presets and assign them to an album, artist, or playlist, and
        they'll switch in on their own when that music plays. If you already have a curve, import
        it from AutoEq or Equalizer APO, or pick your headphones from the 736 oratory1990 profiles
        that come bundled with the app.
      </p>
      <p class="mt-4">
        A preamp with auto-gain and a clip indicator help keep the bolder curves from distorting.
      </p>
    </template>

    <TourShot :shot="shots.toolsEqualizer" :alt="SHOT_ALTS['tools-equalizer']" :sizes="half" />
  </UPageSection>

  <UPageSection
    id="cd-ripping"
    headline="New in 1.1"
    title="CD Ripping"
    orientation="horizontal"
    class="section-rule"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Pop in a CD and rip it straight into your library from the Tools tab. Oscine identifies the
        disc, looks it up on MusicBrainz, and lets you choose the right release when there are a
        few pressings to pick from. The cover art comes along from the Cover Art Archive.
      </p>
      <p class="mt-4">
        Each track is encoded to FLAC, tagged, named with a template you control, and added to your
        library as soon as it's done. Turn on verify to rip every track twice and compare, and if a
        rip gets interrupted you can pick it back up where it stopped.
      </p>
    </template>

    <TourShot :shot="shots.toolsCdrip" :alt="SHOT_ALTS['tools-cdrip']" :sizes="half" />
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
        The Tunedeck is a drawer on the right side of the app that stays open while you browse.
        Its four tabs (Artist, Track, Related, and Playing) each give you a different look at
        whatever you're listening to.
      </p>
      <p class="mt-4">
        Related picks up the rest of the album first, then looser matches from your library by
        genre, year, or folder. Turn on online lookups and the Artist tab fills in with a biography
        and band line-ups. Leave them off and everything from your own library still works.
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
        Oscine comes with three themes, Oscine, Nocturne, and High Contrast, and each one has a
        light and a dark variant. If you want to take it further, the theme editor lets you adjust
        color, type, and motion right down to the individual tokens. When a color pairing gets hard
        to read, a contrast warning shows up on the row that caused it.
      </p>
      <p class="mt-4">
        You can also let the accent color follow the album art of whatever's playing. An accent you
        set by hand in the editor always takes priority.
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
        Your playlists live on a rail along the left with My Favorites pinned to the top, and any of
        them can be exported to .m3u8 when you want to take a list somewhere else.
      </p>
      <p class="mt-4">
        The queue works in two layers. Tracks you add by hand sit above the rest of your session,
        so shuffling mixes up everything else and leaves the songs you picked out right where you
        put them.
      </p>
      <p class="mt-4">
        Discover builds shelves out of your own files and listening history using nine recipes,
        like Sitting unplayed, Forgotten favorites, and Almost finished. Every card tells you why
        it's there, and you can save any shelf you like as a playlist.
      </p>
    </template>

    <TourShot :shot="shots.curateDiscover" :alt="SHOT_ALTS['curate-discover']" :sizes="half" />
  </UPageSection>

  <UPageSection
    id="lyrics"
    title="Stage & Zen"
    orientation="horizontal"
    reverse
    class="section-rule"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        The Stage gives Now Playing the whole window, with the album art front and center and a
        waveform ribbon for the track you're hearing.
      </p>
      <p class="mt-4">
        As of 1.1 it shows lyrics too, and synced lyrics scroll along with the song. Oscine reads
        them from a .lrc file next to the track or from the file's own tags, and with online
        lookups on it can find them on LRCLIB.
      </p>
      <p class="mt-4">
        Zen mode drops the title bar, the tabs, and the transport controls and goes fullscreen. Put
        it up on a TV or a second monitor and leave it running.
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
        Playback is gapless by default. If you'd rather have a crossfade between tracks, set a
        duration and Oscine blends each song into the next.
      </p>
      <p class="mt-4">
        ReplayGain is read from your tags when it's there, and untagged tracks can be measured in
        the background. Oscine plays FLAC, MP3, Ogg Vorbis, Opus, AAC, and WAV.
      </p>
    </template>

    <TourShot
      :shot="shots.trackInfo"
      :alt="SHOT_ALTS['track-info']"
      :sizes="half"
      variant="natural"
    />
  </UPageSection>

  <UPageSection
    title="Stats"
    orientation="horizontal"
    reverse
    class="section-rule"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Stats is your listening log, with your top artists, albums, and tracks over whatever time
        range you pick. Every listen is recorded with the tags it had at the time, so renaming a
        track or reorganizing your folders later won't rewrite last year's numbers.
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
        Subscribe to your shows, download episodes, and listen, all from their own tab. Podcasts
        are kept apart from your music, so episodes never turn up in your library, your searches,
        or your ReplayGain.
      </p>
    </template>

    <TourShot :shot="shots.podcasts" :alt="SHOT_ALTS.podcasts" :sizes="half" />
  </UPageSection>

  <UPageSection
    id="tag-editing"
    title="Tag Editing"
    orientation="horizontal"
    reverse
    class="section-rule"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Clean up your tags without leaving the app. With 1.1 the editor covers nearly every field a
        file can carry, from album artist and composers to sort names, ISRCs, and MusicBrainz IDs.
      </p>
      <p class="mt-4">
        Your edits don't touch the files right away. They're staged in the Tools tab, where you can
        look over every change side by side and pick exactly what gets written. Oscine keeps a
        backup of each original until the write checks out, and puts it back if anything doesn't
        match.
      </p>
    </template>

    <ShotStack>
      <template #base>
        <TourShot :shot="shots.tagEditor" :alt="SHOT_ALTS['tag-editor']" :sizes="stacked" />
      </template>
      <template #overlay>
        <TourShot
          :shot="shots.toolsWriteback"
          :alt="SHOT_ALTS['tools-writeback']"
          :sizes="inset"
          :frame="lifted"
        />
      </template>
    </ShotStack>
  </UPageSection>

  <UPageSection
    title="Quick access"
    orientation="horizontal"
    class="section-rule bg-elevated/40"
    :ui="sectionUi"
  >
    <template #description>
      <p>
        Press
        <UKbd>Ctrl</UKbd>
        <UKbd class="ml-1">K</UKbd>
        from anywhere to open the command palette. Start with a prefix to narrow it down:
        <code class="text-primary">&gt;</code>
        for actions,
        <code class="text-primary">@</code>
        for artists,
        <code class="text-primary">#</code>
        for playlists, and
        <code class="text-primary">/</code>
        for settings. You can start an artist playing or shuffle your whole library right from the
        palette.
      </p>
      <p class="mt-4">
        The Quick Menu on Now Playing keeps your favorite playlists, recent additions, and favorite
        artists a click away, and a set of global shortcuts covers playback and navigation.
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

  <UPageSection id="discord" title="Scrobbling & Discord" class="section-rule">
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
        <span
          class="inline-flex items-center gap-2.5 rounded-xl border border-default bg-elevated/60 px-4 py-2.5 text-highlighted"
        >
          <UIcon name="i-tabler-brand-discord" class="size-7 text-primary" />
          Discord
        </span>
      </div>
      <p class="mt-4">
        Choose one or both scrobbling services. Oscine will keep track offline and update once
        connected to the net.
      </p>
      <p class="mt-2">
        New in 1.1, Discord presence shows what you're listening to on your profile, with the album
        art and a status line you can word however you like.
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
