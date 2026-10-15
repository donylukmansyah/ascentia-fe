import { stripSearchParams } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

import { normalizeProductSearch } from '#/features/products/api/product-input'
import {
  PRODUCT_LIST_PAGE_SIZE,
  featuredProductsQueryOptions,
  productTaxonomiesQueryOptions,
  productsQueryOptions,
} from '#/features/products/api/product-queries'
import type {
  ProductGroup,
  ProductSearch,
} from '#/features/products/types/product'

export const listingSearchConfig = {
  validateSearch: normalizeProductSearch,
  search: {
    middlewares: [
      stripSearchParams<ProductSearch>({ category: '', q: '', page: 1 }),
    ],
  },
  loaderDeps: ({ search }: { search: ProductSearch }) => search,
}

export function prefetchListing(
  queryClient: QueryClient,
  group: ProductGroup,
  deps: ProductSearch,
  preload: boolean,
) {
  if (!import.meta.env.SSR) {
    void queryClient
      .ensureQueryData(featuredProductsQueryOptions())
      .catch(() => undefined)
  }
  const resources = Promise.allSettled([
    queryClient.ensureQueryData(productTaxonomiesQueryOptions()),
    queryClient.ensureQueryData(
      productsQueryOptions({
        group,
        category: deps.category,
        search: deps.q,
        page: deps.page,
        perPage: PRODUCT_LIST_PAGE_SIZE,
      }),
    ),
  ])
  if (import.meta.env.SSR || preload) return resources.then(() => undefined)
}

export function listingMeta(title: string, description: string) {
  return {
    head: () => ({
      meta: [{ title }, { name: 'description', content: description }],
    }),
  }
}
