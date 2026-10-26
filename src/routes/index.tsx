import { createFileRoute } from '@tanstack/react-router'

import { HomePage } from '#/features/home/pages/home-page'
import { featuredProductsQueryOptions } from '#/features/products/api/product-queries'
import { createSeoMeta, SITE_URL, toAbsoluteUrl } from '#/lib/seo'

export const Route = createFileRoute('/')({
  loader: ({ context, preload }) => {
    const resources = Promise.allSettled([
      context.queryClient.ensureQueryData(featuredProductsQueryOptions()),
    ])
    if (import.meta.env.SSR || preload) return resources.then(() => undefined)
  },
  head: () =>
    createSeoMeta({
      title: 'Home | Ascentia Arsya Analitika',
      description:
        'Analytical instruments, certified reference materials, and technical support for laboratories and industry.',
      path: '/',
      schema: [
        {
          '@type': 'Organization',
          '@id': `${SITE_URL}/#organization`,
          name: 'PT Ascentia Arsya Analitika',
          url: SITE_URL,
          logo: toAbsoluteUrl('/brand/logo-color.webp'),
        },
        {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          name: 'Ascentia',
          url: SITE_URL,
          publisher: { '@id': `${SITE_URL}/#organization` },
        },
      ],
    }),
  component: HomePage,
})
