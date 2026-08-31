import vue from '@astrojs/vue'
import ui from '@nuxt/ui/vite'
import vercel from '@astrojs/vercel'
import sharp from 'sharp'
import { defineConfig } from 'astro/config'
import type { Plugin } from 'vite'

/**
 * `import x from './shot.png?bloom'` gives a 32px WebP of that image as a data
 * URI. Blown up and blurred behind a screenshot it becomes an ambient wash of
 * the shot's own colors (see src/data/bloom.ts and .shot-bloom in global.css).
 *
 * `pre` so this beats astro:assets to the .png — the query alone is not enough.
 */
function bloom(): Plugin {
  const SUFFIX = '?bloom'
  return {
    name: 'oscine:bloom',
    enforce: 'pre',
    async load(id) {
      if (!id.endsWith(SUFFIX)) return null
      const webp = await sharp(id.slice(0, -SUFFIX.length))
        .resize(32, null, { fit: 'inside' })
        .webp({ quality: 62 })
        .toBuffer()
      const uri = `data:image/webp;base64,${webp.toString('base64')}`
      return `export default ${JSON.stringify(uri)}`
    }
  }
}

export default defineConfig({
  site: 'https://oscine.app',
  output: 'static',
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),
  integrations: [
    vue({
      appEntrypoint: './src/vue-app.ts'
    })
  ],
  vite: {
    plugins: [
      bloom(),
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
              'i-tabler-arrows-diagonal',
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
