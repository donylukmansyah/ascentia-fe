import { queryOptions } from '@tanstack/react-query'

import { retryWordPressQuery } from '#/lib/wordpress-query'
import { validateListInput } from './product-input'

import {
  getProduct,
  getProducts,
  getProductTaxonomies,
  getRelatedProducts,
} from './product-api'
import type { ProductListInput } from '../types/product'

export function productTaxonomiesQueryOptions() {
  return queryOptions({
    queryKey: ['products', 'taxonomies'],
    retry: retryWordPressQuery,
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
    retry: retryWordPressQuery,
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
    retry: retryWordPressQuery,
    queryFn: ({ signal }) => getProduct({ data: slug, signal }),
    staleTime: 60_000,
  })
}

export function relatedProductsQueryOptions(id: string, brandId: string) {
  return queryOptions({
    queryKey: ['products', 'related', id, brandId],
    retry: retryWordPressQuery,
    queryFn: ({ signal }) =>
      getRelatedProducts({ data: { id, brandId }, signal }),
    staleTime: 60_000,
  })
}
