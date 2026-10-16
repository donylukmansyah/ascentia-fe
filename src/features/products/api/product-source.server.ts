import { createKeyedCache, createTaxonomyCache } from './product-taxonomy-cache'

import {
  array,
  mapProduct,
  mapProductImages,
  mapTaxonomies,
  paginationTotals,
  positiveId,
  record,
  sanitizeProductHtml,
  text,
} from './product-mapper'
import type {
  ProductDetailData,
  ProductListInput,
  ProductListResult,
  ProductTaxonomies,
} from '../types/product'

const listFields = 'id,name,permalink,images,categories'

async function request(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal,
) {
  const base =
    process.env.WORDPRESS_URL ||
    (import.meta.env.DEV ? 'http://ascentia-local.local' : '')
  if (!base) throw new Error('WORDPRESS_URL is not configured')
  const origin = new URL(base)
  if (
    !['http:', 'https:'].includes(origin.protocol) ||
    origin.username ||
    origin.password
  )
    throw new Error('Invalid WordPress configuration')
  const url = new URL(`/wp-json/${path}`, origin)
  url.search = new URLSearchParams(params).toString()
  const timeout = AbortSignal.timeout(12000)
  const started = performance.now()
  let status: number | undefined
  let operation = 'fetch'
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    })
    status = response.status
    if (!response.ok) {
      operation = 'http'
      throw new Error(`WordPress request failed (${status})`)
    }
    operation = 'json'
    return {
      data: (await response.json()) as unknown,
      headers: response.headers,
    }
  } catch {
    const externalTimeout =
      signal?.aborted && signal.reason?.name === 'TimeoutError'
    const cancelled = signal?.aborted && !externalTimeout
    const reason = cancelled
      ? 'cancelled'
      : timeout.aborted || externalTimeout
        ? 'timeout'
        : operation
    if (!cancelled) {
      console.error('WordPress request failed', {
        resource: path.replace(/\/\d+$/, '/:id'),
        status,
        reason,
        durationMs: Math.round(performance.now() - started),
      })
    }
    const message = cancelled
      ? 'WordPress request cancelled'
      : reason === 'timeout'
        ? 'WordPress request timed out'
        : reason === 'http'
          ? `WordPress request failed (${status})`
          : reason === 'json'
            ? 'Invalid WordPress JSON response'
            : 'WordPress connection failed'
    if (cancelled) throw signal.reason
    const error = new Error(message)
    error.name =
      reason === 'timeout'
        ? 'TimeoutError'
        : reason === 'http'
          ? `WordPressHttp${status}`
          : reason === 'json'
            ? 'WordPressJsonError'
            : 'WordPressNetworkError'
    throw error
  }
}

export const readTaxonomies = createTaxonomyCache(fetchTaxonomies)

async function fetchTaxonomies(): Promise<ProductTaxonomies> {
  const signal = AbortSignal.timeout(12000)
  const terms: unknown[] = []
  const seen = new Set<number>()
  let page = 1
  for (;;) {
    const result = await request(
      'wc/store/v1/products/categories',
      {
        page: String(page),
        per_page: '100',
        hide_empty: 'false',
        _fields: 'id,name,slug,parent,count,image',
      },
      signal,
    )
    const entries = array(result.data)
    for (const entry of entries) {
      const id = positiveId(record(entry).id)
      if (seen.has(id)) throw new Error('Invalid category pagination')
      seen.add(id)
      terms.push(entry)
    }
    const pageCount = result.headers.get('X-WP-TotalPages')
    if (pageCount !== null) {
      if (
        !/^\d+$/.test(pageCount) ||
        !Number.isSafeInteger(Number(pageCount))
      ) {
        throw new Error('Invalid category pagination metadata')
      }
      if (page >= Number(pageCount)) break
    } else if (entries.length < 100) break
    if (!entries.length) break
    page++
  }
  return mapTaxonomies(terms)
}

async function fetchProducts(
  input: ProductListInput,
  signal?: AbortSignal,
): Promise<ProductListResult> {
  const { page = 1, perPage = 8, search = '', category = '', group } = input
  const params: Record<string, string> = {
    page: String(page),
    per_page: String(perPage),
    search,
    orderby: 'date',
    order: 'desc',
    _fields: listFields,
  }
  if (input.featured !== undefined) params.featured = String(input.featured)
  if (input.excludeId) params.exclude = input.excludeId
  const taxonomyPromise = readTaxonomies(signal)
  let response: Awaited<ReturnType<typeof request>>
  let taxonomy: ProductTaxonomies
  if (category && group) {
    taxonomy = await taxonomyPromise
    const term = taxonomy[group].find((item) => item.slug === category)
    if (!term)
      return { items: [], total: 0, totalPages: 0, page, invalidCategory: true }
    params.category = term.id
    response = await request('wc/store/v1/products', params, signal)
  } else {
    ;[taxonomy, response] = await Promise.all([
      taxonomyPromise,
      request('wc/store/v1/products', params, signal),
    ])
  }
  return {
    items: array(response.data).map((entry) => mapProduct(entry, taxonomy)),
    ...paginationTotals(response.headers),
    page,
    invalidCategory: false,
  }
}

const cachedProducts = createKeyedCache(
  (key, signal) => fetchProducts(JSON.parse(key) as ProductListInput, signal),
  60_000,
)

export async function readProducts(
  input: ProductListInput,
  signal?: AbortSignal,
): Promise<ProductListResult> {
  const key = JSON.stringify({
    page: input.page ?? 1,
    perPage: input.perPage ?? 8,
    search: input.search ?? '',
    category: input.category ?? '',
    group: input.group,
    featured: input.featured,
    excludeId: input.excludeId,
  })
  return cachedProducts(key, signal)
}

async function fetchProductDetail(
  slug: string,
  signal?: AbortSignal,
): Promise<ProductDetailData | null> {
  const [lookup, taxonomy] = await Promise.all([
    request(
      'wp/v2/product',
      {
        slug,
        per_page: '2',
        _fields: 'id,slug,status,date,modified,acf',
        acf_format: 'standard',
      },
      signal,
    ),
    readTaxonomies(signal),
  ])
  const matches = array(lookup.data)
  if (!matches.length) return null
  if (matches.length !== 1) throw new Error('Ambiguous product slug')
  const wp = record(matches[0])
  if (wp.slug !== slug || wp.status !== 'publish') return null
  const id = positiveId(wp.id)
  const store = await request(
    `wc/store/v1/products/${id}`,
    { _fields: `${listFields},description,short_description,tags` },
    signal,
  )
  const raw = record(store.data)
  if (positiveId(raw.id) !== id) throw new Error('Product ID mismatch')
  const product = mapProduct(raw, taxonomy)
  const acf = wp.acf && !Array.isArray(wp.acf) ? record(wp.acf) : {}
  return {
    ...product,
    slug,
    images: mapProductImages(raw.images),
    brandLogo: taxonomy.brands.find((term) => term.id === product.brandId)
      ?.logo,
    descriptionHtml: sanitizeProductHtml(raw.description, taxonomy),
    summaryHtml: sanitizeProductHtml(raw.short_description, taxonomy),
    specificationsHtml: sanitizeProductHtml(acf.specifications, taxonomy),
    applicationsHtml: sanitizeProductHtml(acf.applications, taxonomy),
    tags: [
      ...new Set(
        [...taxonomy.types, ...taxonomy.applications]
          .filter((term) =>
            [...product.typeIds, ...product.applicationIds].includes(term.id),
          )
          .map((term) => term.name),
      ),
    ],
    publishedAt: text(wp.date),
    modifiedAt: text(wp.modified),
  }
}

const cachedProductDetail = createKeyedCache(
  (slug, signal) => fetchProductDetail(slug, signal),
  60_000,
)

export async function readProductDetail(
  slug: string,
  signal?: AbortSignal,
): Promise<ProductDetailData | null> {
  return cachedProductDetail(slug, signal)
}

async function fetchRelatedProducts(
  product: { id: string; brandId: string },
  signal?: AbortSignal,
) {
  if (!product.brandId) return []
  const [result, taxonomy] = await Promise.all([
    request(
      'wc/store/v1/products',
      {
        category: product.brandId,
        exclude: product.id,
        per_page: '4',
        orderby: 'date',
        order: 'desc',
        _fields: listFields,
      },
      signal,
    ),
    readTaxonomies(signal),
  ])
  return array(result.data).map((entry) => mapProduct(entry, taxonomy))
}

const cachedRelatedProducts = createKeyedCache((key, signal) => {
  const [id, brandId] = key.split(':')
  return fetchRelatedProducts({ id, brandId }, signal)
}, 60_000)

export async function readRelatedProducts(
  product: { id: string; brandId: string },
  signal?: AbortSignal,
) {
  if (!product.brandId) return []
  return cachedRelatedProducts(`${product.id}:${product.brandId}`, signal)
}
