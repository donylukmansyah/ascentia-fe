import { readSearchArticles } from '#/features/articles/api/article-source.server'
import { readProducts } from '#/features/products/api/product-source.server'

import type { SearchInput, SearchItem } from '../types/search'

export async function readSearch(
  input: SearchInput,
  signal?: AbortSignal,
): Promise<SearchItem[]> {
  const { query, group } = input
  if (group === 'products') {
    const { items } = await readProducts(
      { search: query, perPage: 4, page: 1 },
      signal,
    )
    return items.map((item) => ({
      id: item.id,
      title: item.name,
      slug: item.slug,
      image: item.image,
      imageSrcSet: item.imageSrcSet,
      meta: item.brand,
      group,
    }))
  }
  const items = await readSearchArticles(query, group, signal)
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    image: item.image,
    meta: item.date,
    group,
  }))
}
