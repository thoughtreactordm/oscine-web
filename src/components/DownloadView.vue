<script setup lang="ts">
import { computed, ref } from 'vue'
import { debPackageName, formatBytes, type ReleaseAsset, type Release } from '../data/release'

const props = defineProps<{
  release: Release
}>()

interface DownloadCard {
  id: string
  heading: string
  requirement: string
  icon: string
  buttonLabel: string
  primary: boolean
  asset: ReleaseAsset
}

const cards = computed<DownloadCard[]>(() => {
  const windows: DownloadCard = {
    id: 'windows',
    heading: 'Windows',
    requirement: 'Windows 10 or later, 64-bit',
    icon: 'i-tabler-brand-windows',
    buttonLabel: 'Windows installer',
    primary: true,
    asset: props.release.windows
  }

  if (props.release.linux.kind === 'archive') {
    return [
      windows,
      {
        id: 'linux',
        heading: 'Linux',
        requirement: 'x86_64 · AppImage and .deb inside',
        icon: 'i-tabler-file-zip',
        buttonLabel: 'Linux tarball',
        primary: false,
        asset: props.release.linux.asset
      }
    ]
  }

  return [
    windows,
    {
      id: 'appImage',
      heading: 'Linux · AppImage',
      requirement: 'x86_64 · runs anywhere, needs FUSE 2',
      icon: 'i-tabler-app-window',
      buttonLabel: 'AppImage',
      primary: false,
      asset: props.release.linux.appImage
    },
    {
      id: 'deb',
      heading: 'Linux · .deb',
      requirement: 'x86_64 · Debian and Ubuntu',
      icon: 'i-tabler-brand-debian',
      buttonLabel: '.deb package',
      primary: false,
      asset: props.release.linux.deb
    }
  ]
})

const gridClass = computed(() =>
  cards.value.length >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'
)

const isArchive = computed(() => props.release.linux.kind === 'archive')
const debName = computed(() => debPackageName(props.release.version))

const copied = ref<string | null>(null)

async function copyHash(sha256: string | null) {
  if (!sha256) return
  try {
    await navigator.clipboard.writeText(sha256)
    copied.value = sha256
    window.setTimeout(() => {
      if (copied.value === sha256) copied.value = null
    }, 2000)
  } catch {
    // Clipboard can be denied; the hash stays visible to copy by hand.
  }
}

/** Middle-truncate a 64-char hash so it reads on one line instead of wrapping. */
function shortSha(sha256: string): string {
  return `${sha256.slice(0, 12)}…${sha256.slice(-12)}`
}

function sizeLabel(size: number | null): string | null {
  return size == null ? null : formatBytes(size)
}
</script>

<template>
  <div class="relative">
    <div class="amber-glow amber-glow--top" aria-hidden="true" />

    <UContainer class="relative">
      <UPageHeader
        headline="Download"
        :title="`Get Oscine ${release.version}`"
        description="Free for Windows and Linux. Pick your platform, grab the download, and check the SHA-256 against your copy if you like."
      />

      <UPageBody>
        <div class="grid grid-cols-1 gap-4" :class="gridClass">
          <UPageCard
            v-for="card in cards"
            :key="card.id"
            variant="subtle"
            :ui="{ body: 'flex h-full flex-col' }"
            :class="card.primary ? 'ring-1 ring-primary/25' : ''"
          >
            <div class="flex items-center gap-3">
              <span
                class="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"
              >
                <UIcon :name="card.icon" class="size-6" />
              </span>
              <div class="min-w-0">
                <h2 class="display text-lg font-semibold text-highlighted">{{ card.heading }}</h2>
                <p class="text-sm text-muted">{{ card.requirement }}</p>
              </div>
            </div>

            <div class="mt-auto pt-6">
              <div class="flex items-baseline gap-2">
                <code class="min-w-0 truncate font-mono text-sm text-toned">{{
                  card.asset.name
                }}</code>
                <span v-if="sizeLabel(card.asset.size)" class="shrink-0 text-xs text-muted">
                  {{ sizeLabel(card.asset.size) }}
                </span>
              </div>

              <UButton
                :href="card.asset.url"
                :color="card.primary ? 'primary' : 'neutral'"
                :variant="card.primary ? 'solid' : 'subtle'"
                size="lg"
                block
                trailing-icon="i-tabler-download"
                class="mt-3"
              >
                {{ card.buttonLabel }}
              </UButton>

              <div
                v-if="card.asset.sha256"
                class="mt-3 flex items-center gap-2 rounded-lg border border-default bg-elevated/40 py-1 pl-2.5 pr-1"
              >
                <span
                  class="shrink-0 text-[0.625rem] font-semibold uppercase tracking-wider text-dimmed"
                >
                  SHA-256
                </span>
                <code
                  :title="card.asset.sha256"
                  class="min-w-0 flex-1 truncate font-mono text-xs text-muted"
                  >{{ shortSha(card.asset.sha256) }}</code
                >
                <UButton
                  :icon="copied === card.asset.sha256 ? 'i-tabler-check' : 'i-tabler-copy'"
                  :color="copied === card.asset.sha256 ? 'primary' : 'neutral'"
                  variant="ghost"
                  size="xs"
                  square
                  :aria-label="`Copy SHA-256 for ${card.asset.name}`"
                  @click="copyHash(card.asset.sha256)"
                />
              </div>
            </div>
          </UPageCard>
        </div>

        <UPageCard
          icon="i-tabler-checklist"
          title="What you need"
          variant="subtle"
          class="mt-4"
        >
          <template #description>
            <ul class="space-y-2 text-sm text-muted">
              <li class="flex gap-2">
                <UIcon name="i-tabler-brand-windows" class="mt-0.5 size-4 shrink-0 text-dimmed" />
                <span><span class="text-toned">Windows</span> 10 or later, 64-bit.</span>
              </li>
              <li class="flex gap-2">
                <UIcon name="i-tabler-app-window" class="mt-0.5 size-4 shrink-0 text-dimmed" />
                <span>
                  <span class="text-toned">AppImage</span> — Linux x86_64. Mark it executable and
                  run it. Needs FUSE 2, or launch with
                  <code class="text-toned">--appimage-extract-and-run</code>.
                </span>
              </li>
              <li class="flex gap-2">
                <UIcon name="i-tabler-brand-debian" class="mt-0.5 size-4 shrink-0 text-dimmed" />
                <span>
                  <span class="text-toned">.deb</span> — Debian and Ubuntu-family. Install with
                  <code class="text-toned">sudo apt install ./{{ debName }}</code>.
                </span>
              </li>
              <li v-if="isArchive" class="flex gap-2">
                <UIcon name="i-tabler-file-zip" class="mt-0.5 size-4 shrink-0 text-dimmed" />
                <span>Unpack the tarball first — the AppImage and the .deb are both inside.</span>
              </li>
            </ul>
          </template>
        </UPageCard>

        <div class="mt-6 flex flex-col gap-2 text-sm text-muted">
          <p>
            Oscine 1.0.3 and later can update itself. Open
            <span class="text-toned">Settings → About</span> and click
            <span class="text-toned">Check for updates</span>. The Windows installer and the
            AppImage download the new version and install it when you restart. The .deb can check
            too, but it cannot replace itself, so grab the new package here and install it with apt
            the same way you did the first time. Oscine only checks when you ask.
          </p>
          <p>
            On an older version? Install the latest build from this page once, and updates work
            from then on. Every release is written up on the
            <ULink to="/changelog" class="text-primary hover:underline">changelog</ULink>.
          </p>
          <p>macOS is not a target.</p>
        </div>
      </UPageBody>
    </UContainer>
  </div>
</template>
