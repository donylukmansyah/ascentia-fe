import { useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { ProductListingPage } from '#/features/products/pages/product-listing-page'
import type { ProductSearch } from '#/features/products/types/product'

import {
  listingMeta,
  listingSearchConfig,
  prefetchListing,
} from './-listing'

export const Route = createFileRoute('/products/brands')({
  ...listingSearchConfig,
  loader: ({ context, deps, preload }) =>
    prefetchListing(context.queryClient, 'brands', deps, preload),
  ...listingMeta(
    'All Brands | Ascentia Arsya Analitika',
    'Browse analytical instruments, sample preparation equipment, and certified reference materials by brand.',
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
      group="brands"
      search={search}
      onSearchChange={onSearchChange}
    />
  )
}
