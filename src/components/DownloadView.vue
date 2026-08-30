<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  debPackageName,
  downloadTargets,
  formatBytes,
  type Release
} from '../data/release'

const props = defineProps<{
  release: Release
}>()

const targets = computed(() => downloadTargets(props.release))
const copied = ref<string | null>(null)

const description = computed(() => {
  if (props.release.linux.kind === 'archive') {
    return 'Windows installer and a Linux tarball that contains the AppImage and the .deb.'
  }
  return 'Windows installer, Linux AppImage, and a .deb for Debian and Ubuntu.'
})

const debName = computed(() => debPackageName(props.release.version))

async function copyHash(sha256: string | null) {
  if (!sha256) return
  try {
    await navigator.clipboard.writeText(sha256)
    copied.value = sha256
  } catch {
    // Clipboard can be denied; the hash stays visible to copy by hand.
  }
}

function sizeLabel(size: number | null): string | null {
  return size == null ? null : formatBytes(size)
}
</script>

<template>
  <UContainer>
    <UPageHeader
      headline="Download"
      :title="`Get Oscine ${release.version}`"
      :description="description"
    />

    <UPageBody>
      <UPageGrid class="lg:grid-cols-2">
        <UPageCard
          v-for="target in targets"
          :key="target.id"
          :title="target.heading"
          variant="subtle"
        >
          <template #description>
            <span class="font-mono text-sm text-toned">{{ target.asset.name }}</span>
            <span v-if="sizeLabel(target.asset.size)" class="text-muted">
              · {{ sizeLabel(target.asset.size) }}
            </span>
          </template>

          <template #footer>
            <UButton
              :href="target.asset.url"
              :color="target.color"
              :variant="target.variant"
              size="lg"
              :icon="target.icon"
              trailing-icon="i-tabler-download"
            >
              {{ target.label }}
            </UButton>

            <p v-if="target.id === 'linux'" class="mt-4 text-sm text-muted">
              The archive contains the AppImage and
              <code class="text-toned">{{ debName }}</code>.
            </p>

            <div v-if="target.asset.sha256" class="mt-4 flex items-start gap-2">
              <div class="min-w-0 flex-1">
                <p class="text-xs font-medium uppercase tracking-wider text-dimmed">SHA-256</p>
                <code class="mt-1 block break-all font-mono text-xs text-toned">{{
                  target.asset.sha256
                }}</code>
              </div>
              <UButton
                :icon="copied === target.asset.sha256 ? 'i-tabler-check' : 'i-tabler-copy'"
                color="neutral"
                variant="ghost"
                size="sm"
                square
                :aria-label="`Copy SHA-256 for ${target.asset.name}`"
                @click="copyHash(target.asset.sha256)"
              />
            </div>
          </template>
        </UPageCard>
      </UPageGrid>

      <UPageCard title="What you need" variant="subtle">
        <template #description>
          Windows 10 or later, 64-bit. Linux x86_64. The AppImage needs FUSE 2 or
          <code class="text-toned">--appimage-extract-and-run</code>. The
          <code class="text-toned">.deb</code>
          is for Debian and Ubuntu-family.
        </template>
        <template v-if="release.linux.kind === 'archive'" #footer>
          <p class="text-sm text-muted">Unpack the tarball.</p>
          <p class="mt-2 text-sm text-muted">
            Run the AppImage, or
            <code class="text-toned">sudo apt install ./{{ debName }}</code>.
          </p>
        </template>
      </UPageCard>

      <div class="space-y-3 text-sm text-muted">
        <p>
          Updates are manual: download a new version from the
          <ULink to="/changelog">changelog</ULink>.
        </p>
        <p>macOS is not a target.</p>
      </div>
    </UPageBody>
  </UContainer>
</template>
