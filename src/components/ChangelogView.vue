<script setup lang="ts">
import type { BadgeProps, ButtonProps } from '@nuxt/ui'
import type { ChangelogRelease } from '../data/releases'

defineProps<{
  releases: ChangelogRelease[]
}>()

const links: ButtonProps[] = [
  {
    label: 'Download',
    to: '/download',
    color: 'primary',
    trailingIcon: 'i-tabler-arrow-right'
  }
]

const preReleaseBadge: BadgeProps = {
  label: 'Pre-release',
  color: 'warning',
  variant: 'subtle'
}
</script>

<template>
  <UContainer>
    <UPageHeader
      headline="Changelog"
      title="Release notes"
      description="What changed in each Oscine version. Installers and checksums are on the Download page."
      :links="links"
    />

    <UPageBody>
      <UChangelogVersions :indicator-motion="false">
        <UChangelogVersion
          v-for="release in releases"
          :key="release.tag"
          :title="release.version"
          :date="release.publishedAt"
          :badge="release.prerelease ? preReleaseBadge : undefined"
        >
          <template v-if="release.html" #body>
            <div class="doc-body" v-html="release.html" />
          </template>
          <template #footer>
            <UButton
              :href="release.htmlUrl"
              target="_blank"
              color="neutral"
              variant="link"
              trailing-icon="i-tabler-external-link"
            >
              GitHub release
            </UButton>
          </template>
        </UChangelogVersion>
      </UChangelogVersions>
    </UPageBody>
  </UContainer>
</template>
