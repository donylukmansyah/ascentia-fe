import { queryOptions } from '@tanstack/react-query'

import { validateListInput } from './product-input'

import {
  getProduct,
  getProducts,
  getProductTaxonomies,
  getRelatedProducts,
} from './product-api'
import type { ProductListInput } from '../types/product'

function retryProductQuery(failureCount: number, error: Error) {
  if (import.meta.env.SSR || failureCount >= 1) return false
  return (
    ['TimeoutError', 'WordPressNetworkError', 'WordPressHttp429'].includes(
      error.name,
    ) ||
    /^WordPressHttp5\d{2}$/.test(error.name) ||
    /^(WordPress request timed out|WordPress connection failed|WordPress request failed \((429|5\d{2})\))$/.test(
      error.message,
    )
  )
}

export function productTaxonomiesQueryOptions() {
  return queryOptions({
    queryKey: ['products', 'taxonomies'],
    retry: retryProductQuery,
    queryFn: ({ signal }) => getProductTaxonomies({ signal }),
    // Category data changes rarely.
    staleTime: 30 * 60_000,
  })
}

export const PRODUCT_LIST_PAGE_SIZE = 8

export function productsQueryOptions(input: ProductListInput) {
  const data = validateListInput(input)
  return queryOptions({
    queryKey: ['products', 'list', data],
    retry: retryProductQuery,
    queryFn: ({ signal }) => getProducts({ data, signal }),
    staleTime: 60_000,
  })
}

export function featuredProductsQueryOptions() {
  return productsQueryOptions({
    featured: true,
    page: 1,
    perPage: PRODUCT_LIST_PAGE_SIZE,
  })
}

export function productDetailQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ['products', 'detail', slug],
    retry: retryProductQuery,
    queryFn: ({ signal }) => getProduct({ data: slug, signal }),
    staleTime: 60_000,
  })
}

export function relatedProductsQueryOptions(id: string, brandId: string) {
  return queryOptions({
    queryKey: ['products', 'related', id, brandId],
    retry: retryProductQuery,
    queryFn: ({ signal }) =>
      getRelatedProducts({ data: { id, brandId }, signal }),
    staleTime: 60_000,
  })
}
