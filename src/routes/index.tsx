import { createFileRoute } from '@tanstack/react-router'

import { HomePage } from '#/features/home/pages/home-page'
import {
  featuredProductsQueryOptions,
  productTaxonomiesQueryOptions,
} from '#/features/products/api/product-queries'
import { createSeoMeta } from '#/lib/seo'

export const Route = createFileRoute('/')({
  loader: ({ context, preload }) => {
    const resources = Promise.allSettled([
      context.queryClient.ensureQueryData(productTaxonomiesQueryOptions()),
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
    }),
  component: HomePage,
})
