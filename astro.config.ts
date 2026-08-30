import vue from '@astrojs/vue'
import ui from '@nuxt/ui/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://oscine.app',
  integrations: [
    vue({
      appEntrypoint: './src/vue-app.ts'
    })
  ],
  vite: {
    plugins: [
      ui({
        router: false,
        colorMode: false,
        prose: true,
        ui: {
          colors: {
            primary: 'amber',
            neutral: 'taupe'
          },
          pageHero: {
            slots: {
              title: 'display font-semibold'
            }
          },
          pageSection: {
            slots: {
              title: 'display font-semibold'
            }
          },
          pageHeader: {
            slots: {
              title: 'display font-semibold'
            }
          },
          pageCTA: {
            slots: {
              title: 'display font-semibold'
            }
          },
          changelogVersion: {
            slots: {
              title: 'display font-semibold'
            }
          }
        },
        icon: {
          clientBundle: {
            scan: { globInclude: ['**/*.{vue,ts,astro}'] },
            icons: [
              'i-tabler-brand-windows',
              'i-tabler-brand-lastfm',
              'i-tabler-brain',
              'i-tabler-download',
              'i-tabler-terminal-2',
              'i-tabler-package',
              'i-tabler-copy',
              'i-tabler-check',
              'i-tabler-arrow-right',
              'i-tabler-external-link',
              'i-lucide-menu',
              'i-lucide-x'
            ]
          }
        }
      })
    ]
  }
})
