import type {
  ProductGroup,
  ProductListInput,
  ProductSearch,
} from '../types/product.ts'

export function validateListInput(value: unknown): ProductListInput {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid product query')
  const input = value as Record<string, unknown>
  const page = input.page ?? 1
  const perPage = input.perPage ?? 8
  if (!Number.isSafeInteger(page) || Number(page) < 1 || Number(page) > 100000)
    throw new Error('Invalid page')
  if (
    !Number.isSafeInteger(perPage) ||
    Number(perPage) < 1 ||
    Number(perPage) > 100
  )
    throw new Error('Invalid page size')
  if (
    input.group !== undefined &&
    (typeof input.group !== 'string' ||
      !['brands', 'types', 'applications'].includes(input.group))
  )
    throw new Error('Invalid product group')
  const category = input.category ?? ''
  const search = input.search ?? ''
  if (
    typeof category !== 'string' ||
    category.length > 200 ||
    /[/?#]/.test(category)
  )
    throw new Error('Invalid category')
  if (typeof search !== 'string' || search.length > 200)
    throw new Error('Invalid search')
  if (input.featured !== undefined && typeof input.featured !== 'boolean')
    throw new Error('Invalid featured filter')
  if (
    input.excludeId !== undefined &&
    (typeof input.excludeId !== 'string' || !/^\d+$/.test(input.excludeId))
  )
    throw new Error('Invalid excluded product')
  return {
    group: input.group as ProductGroup | undefined,
    category,
    search: search.trim(),
    page: Number(page),
    perPage: Number(perPage),
    featured: input.featured,
    excludeId: input.excludeId,
  }
}

export function validateProductSlug(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value ||
    value.length > 200 ||
    /[/?#\s]/.test(value)
  )
    throw new Error('Invalid product slug')
  return value
}

export function validateRelatedInput(value: unknown): {
  id: string
  brandId: string
} {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid related query')
  const input = value as Record<string, unknown>
  if (
    typeof input.id !== 'string' ||
    !/^\d+$/.test(input.id) ||
    typeof input.brandId !== 'string' ||
    (input.brandId !== '' && !/^\d+$/.test(input.brandId))
  )
    throw new Error('Invalid related product')
  return { id: input.id, brandId: input.brandId }
}

export function normalizeProductSearch(search: {
  category?: unknown
  q?: unknown
  page?: unknown
}): ProductSearch {
  const page = Number(search.page)
  return {
    category:
      typeof search.category === 'string' &&
      search.category.length <= 200 &&
      !/[/?#]/.test(search.category)
        ? search.category
        : '',
    q: typeof search.q === 'string' ? search.q.trim().slice(0, 200) : '',
    page: Number.isSafeInteger(page) && page > 0 && page <= 100000 ? page : 1,
  }
}
