import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  ssr: { noExternal: ['maplibre-gl'] },
  plugins: [
    devtools(),
    nitro({
      compressPublicAssets: { gzip: true, brotli: true },
      routeRules: {
        '/brand/**': { headers: { 'cache-control': 'public, max-age=86400' } },
        '/images/**': { headers: { 'cache-control': 'public, max-age=86400' } },
        '/icons/**': { headers: { 'cache-control': 'public, max-age=86400' } },
      },
      rollupConfig: { external: [/^@sentry\//] },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
