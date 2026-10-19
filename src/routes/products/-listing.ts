import { stripSearchParams } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

import { RouteLoading } from '#/components/layout/route-loading'
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
import { createSeoMeta, listingPath } from '#/lib/seo'

export const listingSearchConfig = {
  validateSearch: normalizeProductSearch,
  search: {
    middlewares: [
      stripSearchParams<ProductSearch>({ category: '', q: '', page: 1 }),
    ],
  },
  loaderDeps: ({ search }: { search: ProductSearch }) => search,
  pendingComponent: RouteLoading,
}

export function prefetchListing(
  queryClient: QueryClient,
  group: ProductGroup,
  deps: ProductSearch,
  cause: 'enter' | 'stay' | 'preload',
) {
  if (!import.meta.env.SSR) {
    void queryClient
      .ensureQueryData(featuredProductsQueryOptions())
      .catch(() => undefined)
  }
  const taxonomyOptions = productTaxonomiesQueryOptions()
  const productOptions = productsQueryOptions({
    group,
    category: deps.category,
    search: deps.q,
    page: deps.page,
    perPage: PRODUCT_LIST_PAGE_SIZE,
  })
  const resources = Promise.allSettled([
    queryClient.ensureQueryData(taxonomyOptions),
    queryClient.ensureQueryData(productOptions),
  ])
  const metadata = () => {
    const taxonomy = queryClient.getQueryData(taxonomyOptions.queryKey)
    const products = queryClient.getQueryData(productOptions.queryKey)
    return {
      search: deps,
      categoryName: taxonomy?.[group].find(
        (term) => term.slug === deps.category,
      )?.name,
      unavailable:
        queryClient.getQueryState(productOptions.queryKey)?.status ===
          'error' ||
        Boolean(
          products &&
          (products.invalidCategory ||
            deps.page > Math.max(1, products.totalPages)),
        ),
    }
  }
  return import.meta.env.SSR || cause !== 'stay'
    ? resources.then(metadata)
    : metadata()
}

export function listingMeta(title: string, description: string, path: string) {
  return {
    head: ({
      loaderData,
    }: {
      loaderData?: Awaited<ReturnType<typeof prefetchListing>>
    }) => {
      const search = loaderData?.search ?? { category: '', q: '', page: 1 }
      const category = loaderData?.categoryName
      return createSeoMeta({
        title: `${category ? `${category} | Ascentia Arsya Analitika` : title}${search.page > 1 ? ` | Page ${search.page}` : ''}`,
        description: category
          ? `Explore ${category} products, specifications, and technical support from Ascentia.`
          : description,
        path: listingPath(path, search),
        robots:
          search.q || loaderData?.unavailable || (search.category && !category)
            ? 'noindex, follow'
            : undefined,
      })
    },
  }
}
