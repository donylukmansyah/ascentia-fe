import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

// Browser only talks to self (/_serverFn) and CARTO map tiles; WP reads are server-side.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // SSR hydration and JSON-LD are inline; no nonce support yet.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
  "media-src 'self' https:",
  // CMS articles may embed these (mirrors sanitize-html allowlist).
  'frame-src https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://player.vimeo.com',
  "connect-src 'self' https://*.cartocdn.com",
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = {
  'content-security-policy': csp,
  'x-frame-options': 'SAMEORIGIN',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy':
    'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=()',
}

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  ssr: { noExternal: ['maplibre-gl'] },
  plugins: [
    devtools(),
    nitro({
      compressPublicAssets: { gzip: true, brotli: true },
      routeRules: {
        '/**': { headers: securityHeaders },
        '/brand/**': {
          headers: { ...securityHeaders, 'cache-control': 'public, max-age=86400' },
        },
        '/images/**': {
          headers: { ...securityHeaders, 'cache-control': 'public, max-age=86400' },
        },
        '/icons/**': {
          headers: { ...securityHeaders, 'cache-control': 'public, max-age=86400' },
        },
      },
      rollupConfig: { external: [/^@sentry\//] },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
