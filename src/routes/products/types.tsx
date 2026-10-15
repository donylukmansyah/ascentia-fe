import { useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { ProductListingPage } from '#/features/products/pages/product-listing-page'
import type { ProductSearch } from '#/features/products/types/product'

import {
  listingMeta,
  listingSearchConfig,
  prefetchListing,
} from './-listing'

export const Route = createFileRoute('/products/types')({
  ...listingSearchConfig,
  loader: ({ context, deps, preload }) =>
    prefetchListing(context.queryClient, 'types', deps, preload),
  ...listingMeta(
    'All Types | Ascentia Arsya Analitika',
    'Browse analytical instruments by type, from sample preparation to precision measurement.',
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
      group="types"
      search={search}
      onSearchChange={onSearchChange}
    />
  )
}
