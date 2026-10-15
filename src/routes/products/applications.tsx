import { useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { ProductListingPage } from '#/features/products/pages/product-listing-page'
import type { ProductSearch } from '#/features/products/types/product'

import {
  listingMeta,
  listingSearchConfig,
  prefetchListing,
} from './-listing'

export const Route = createFileRoute('/products/applications')({
  ...listingSearchConfig,
  loader: ({ context, deps, preload }) =>
    prefetchListing(context.queryClient, 'applications', deps, preload),
  ...listingMeta(
    'All Applications | Ascentia Arsya Analitika',
    'Browse analytical solutions by application, from mining to laboratory research.',
  ),
  component: ProductListingRoute,
})

function ProductListingRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const onSearchChange = useCallback(
    (next: ProductSearch, replace = false) => {
      void navigate({ search: next, replace, resetScroll: false })
    },
    [navigate],
  )
  return (
    <ProductListingPage
      group="applications"
      search={search}
      onSearchChange={onSearchChange}
    />
  )
}
