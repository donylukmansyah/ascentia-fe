import { createFileRoute } from '@tanstack/react-router'

import { HomePage } from '#/features/home/pages/home-page'
import {
  featuredProductsQueryOptions,
  productTaxonomiesQueryOptions,
} from '#/features/products/api/product-queries'

export const Route = createFileRoute('/')({
  loader: ({ context, preload }) => {
    const resources = Promise.allSettled([
      context.queryClient.ensureQueryData(productTaxonomiesQueryOptions()),
      context.queryClient.ensureQueryData(featuredProductsQueryOptions()),
    ])
    if (import.meta.env.SSR || preload) return resources.then(() => undefined)
  },
  head: () => ({
    meta: [
      { title: 'Home | Ascentia Arsya Analitika' },
      {
        name: 'description',
        content:
          'Analytical instruments, certified reference materials, and technical support for laboratories and industry.',
      },
    ],
  }),
  component: HomePage,
})
