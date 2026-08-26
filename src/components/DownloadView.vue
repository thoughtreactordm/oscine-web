<script setup lang="ts">
import { RELEASES_URL, type Release } from '../data/release'
import DownloadButtons from './DownloadButtons.vue'

defineProps<{
  release: Release
}>()
</script>

<template>
  <UContainer>
    <UPageHeader
      headline="Download"
      :title="`Get Oscine ${release.version}`"
      description="Windows installer, Linux AppImage, and a .deb for Debian and Ubuntu. Free. No account."
    />

    <UPageBody>
      <DownloadButtons :release="release" />

      <UPageGrid class="lg:grid-cols-2">
        <UPageCard
          title="Windows"
          description="NSIS installer. Pick your install folder. Oscine does not require a Microsoft account or a store listing."
          variant="subtle"
        />
        <UPageCard title="Linux" variant="subtle">
          <template #description>
            AppImage runs in place. The
            <code class="text-toned">.deb</code>
            is for Debian and Ubuntu amd64. Both register Oscine as an audio player with the desktop.
          </template>
        </UPageCard>
      </UPageGrid>

      <div class="space-y-4 text-sm text-muted">
        <p>
          macOS is not a target. Oscine is new — if something is rough, that is the honest version of
          “we just shipped this,” not a warning that it is a toy.
        </p>
        <p>
          Checksums and previous versions live on
          <ULink :to="RELEASES_URL" target="_blank">GitHub Releases</ULink>.
        </p>
      </div>
    </UPageBody>
  </UContainer>
</template>
