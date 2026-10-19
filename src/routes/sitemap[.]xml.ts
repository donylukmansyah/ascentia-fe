import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { readSitemap } =
            await import('#/features/seo/api/sitemap.server')
          return new Response(await readSitemap(request.signal), {
            headers: {
              'Content-Type': 'application/xml; charset=utf-8',
              'Cache-Control': 'public, max-age=60',
            },
          })
        } catch {
          return new Response('Sitemap temporarily unavailable', {
            status: 503,
            headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' },
          })
        }
      },
    },
  },
})
