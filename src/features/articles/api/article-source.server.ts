import { createKeyedCache } from '#/lib/cache'
import { mapYoastSeo } from '#/lib/seo-content'

import { ARTICLE_CATEGORY_SLUGS } from '../constants/categories'

import {
  array,
  mapArticle,
  mapArticleDetail,
  mapSearchArticle,
  record,
} from './article-mapper'
import type {
  Article,
  ArticleDetailData,
  BlogListingData,
  LatestNewsData,
  NewsListingData,
} from '../types/article'

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
  const timeout = AbortSignal.timeout(10000)
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
        resource: path,
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

type CategoryKey = keyof typeof ARTICLE_CATEGORY_SLUGS
type CategoryIdMap = Record<CategoryKey, number | undefined>

// Resolve category slugs to this install's numeric IDs.
const cachedCategoryIds = createKeyedCache<CategoryIdMap>(
  async (_key, signal) => {
    const { data } = await request(
      'wp/v2/categories',
      { per_page: '100', _fields: 'id,slug' },
      signal,
    )
    const bySlug = new Map<string, number>()
    for (const value of array(data)) {
      const item = record(value)
      if (typeof item.slug === 'string' && Number.isSafeInteger(item.id)) {
        bySlug.set(item.slug, item.id as number)
      }
    }
    return {
      news: bySlug.get(ARTICLE_CATEGORY_SLUGS.news),
      blogs: bySlug.get(ARTICLE_CATEGORY_SLUGS.blogs),
      featuredEvents: bySlug.get(ARTICLE_CATEGORY_SLUGS.featuredEvents),
      recommended: bySlug.get(ARTICLE_CATEGORY_SLUGS.recommended),
    }
  },
  300_000,
)

function categoryIds(signal?: AbortSignal) {
  return cachedCategoryIds('all', signal)
}

// Featured Events listing.
const cachedFeaturedEvents = createKeyedCache<NewsListingData>(
  async (_key, signal) => {
    const ids = await categoryIds(signal)
    if (!ids.featuredEvents) {
      const empty: Article[] = []
      return { featured: empty[0], center: [], right: [] }
    }
    const { data } = await request(
      'wp/v2/posts',
      {
        categories: String(ids.featuredEvents),
        per_page: '6',
        _embed: 'true',
      },
      signal,
    )
    const list = array(data).map(mapArticle)
    return {
      featured: list[0],
      center: list.slice(1, 3),
      right: list.slice(3, 6),
    }
  },
  60_000,
)

// Latest News listing.
const cachedLatestNews = createKeyedCache<LatestNewsData>(
  async (key, signal) => {
    const [pageStr, perPageStr] = key.split(':')
    const page = Number(pageStr) || 1
    const perPage = Number(perPageStr) || 4
    const ids = await categoryIds(signal)
    if (!ids.news) {
      return {
        items: [],
        page,
        perPage,
        total: 0,
        totalPages: 0,
        hasMore: false,
      }
    }
    const { data, headers } = await request(
      'wp/v2/posts',
      {
        categories: String(ids.news),
        page: String(page),
        per_page: String(perPage),
        _embed: 'true',
      },
      signal,
    )
    const items = array(data).map(mapArticle)
    const total = Number(headers.get('x-wp-total') || items.length)
    const totalPages = Number(headers.get('x-wp-totalpages') || 1)

    return {
      items,
      page,
      perPage,
      total,
      totalPages,
      hasMore: items.length < total,
    }
  },
  60_000,
)

// Recommended news listing.
const cachedPopularNews = createKeyedCache<Article[]>(async (_key, signal) => {
  const ids = await categoryIds(signal)
  if (!ids.recommended) return []
  const { data } = await request(
    'wp/v2/posts',
    {
      categories: String(ids.recommended),
      per_page: '5',
      _embed: 'true',
    },
    signal,
  )
  const items = array(data).map(mapArticle)
  return items.slice(0, 5)
}, 60_000)

// Detail by slug.
const cachedNewsDetail = createKeyedCache<ArticleDetailData | null>(
  async (slug, signal) => {
    const { data } = await request(
      'wp/v2/posts',
      {
        slug,
        _embed: 'true',
      },
      signal,
    )
    const items = array(data)
    if (!items.length) return null
    return mapArticleDetail(items[0])
  },
  60_000,
)

// Related news.
const cachedRelatedNews = createKeyedCache<Article[]>(
  async (excludeId, signal) => {
    const ids = await categoryIds(signal)
    const cats = [ids.news, ids.featuredEvents].filter(Boolean).join(',')
    if (!cats) return []
    const { data } = await request(
      'wp/v2/posts',
      {
        categories: cats,
        per_page: '4',
        exclude: excludeId,
        _embed: 'true',
      },
      signal,
    )
    const items = array(data).map(mapArticle)
    return items.slice(0, 3)
  },
  60_000,
)

const cachedSearchArticles = createKeyedCache<Article[]>(
  async (key, signal) => {
    const [query, category] = JSON.parse(key) as [string, 'news' | 'blogs']
    const ids = await categoryIds(signal)
    const id = category === 'news' ? ids.news : ids.blogs
    if (!id) return []
    const { data } = await request(
      'wp/v2/posts',
      {
        search: query,
        categories: String(id),
        status: 'publish',
        per_page: '4',
        orderby: 'relevance',
        _embed: 'true',
      },
      signal,
    )
    return array(data).map(mapSearchArticle)
  },
  60_000,
)

export function readSearchArticles(
  query: string,
  category: 'news' | 'blogs',
  signal?: AbortSignal,
) {
  return cachedSearchArticles(JSON.stringify([query, category]), signal)
}

export async function readArticleSitemap(signal?: AbortSignal) {
  const entries: { path: string; modified: string }[] = []
  const seen = new Set<string>()
  const ids = await categoryIds(signal)
  const cats = [ids.news, ids.blogs, ids.featuredEvents, ids.recommended]
    .filter(Boolean)
    .join(',')
  if (!cats) return entries
  for (let page = 1; ; page++) {
    const { data, headers } = await request(
      'wp/v2/posts',
      {
        page: String(page),
        per_page: '100',
        status: 'publish',
        categories: cats,
        orderby: 'id',
        order: 'asc',
        _fields: 'id,slug,categories,modified_gmt,yoast_head_json.robots',
      },
      signal,
    )
    const posts = array(data)
    for (const value of posts) {
      const post = record(value)
      if (
        !Number.isSafeInteger(post.id) ||
        Number(post.id) <= 0 ||
        typeof post.slug !== 'string' ||
        !post.slug
      ) {
        throw new Error('Invalid article sitemap response')
      }
      const id = String(post.id)
      if (seen.has(id)) throw new Error('Invalid article sitemap pagination')
      seen.add(id)
      if (seen.size > 50_000) throw new Error('Article sitemap limit exceeded')
      if (mapYoastSeo(post.yoast_head_json).robots?.startsWith('noindex'))
        continue
      const categories = array(post.categories)
      const group =
        ids.blogs !== undefined && categories.includes(ids.blogs)
          ? 'blogs'
          : 'news'
      entries.push({
        path: `/${group}/${encodeURIComponent(post.slug)}`,
        modified:
          typeof post.modified_gmt === 'string' ? post.modified_gmt : '',
      })
    }
    const pageCount = headers.get('X-WP-TotalPages')
    if (
      pageCount !== null &&
      (!/^\d+$/.test(pageCount) || !Number.isSafeInteger(Number(pageCount)))
    ) {
      throw new Error('Invalid article sitemap totals')
    }
    const totalPages = pageCount === null ? undefined : Number(pageCount)
    if (totalPages !== undefined ? page >= totalPages : posts.length < 100)
      break
    if (!posts.length) throw new Error('Invalid article sitemap pagination')
  }
  return entries
}

export function readFeaturedEvents(signal?: AbortSignal) {
  return cachedFeaturedEvents('featured', signal)
}

export function readPopularNews(signal?: AbortSignal) {
  return cachedPopularNews('popular', signal)
}

export function readLatestNews(page = 1, perPage = 4, signal?: AbortSignal) {
  return cachedLatestNews(`${page}:${perPage}`, signal)
}

export function readNewsDetail(slug: string, signal?: AbortSignal) {
  return cachedNewsDetail(slug, signal)
}

export function readRelatedNews(excludeId: string, signal?: AbortSignal) {
  return cachedRelatedNews(excludeId, signal)
}

// Blog articles listing.
const cachedBlogArticles = createKeyedCache<BlogListingData>(
  async (key, signal) => {
    const [pageStr, perPageStr] = key.split(':')
    const page = Number(pageStr) || 1
    const perPage = Number(perPageStr) || 12
    const ids = await categoryIds(signal)
    if (!ids.blogs) {
      return { items: [], page, perPage, total: 0, totalPages: 0 }
    }
    const { data, headers } = await request(
      'wp/v2/posts',
      {
        categories: String(ids.blogs),
        page: String(page),
        per_page: String(perPage),
        _embed: 'true',
      },
      signal,
    )
    const items = array(data).map(mapArticle)
    const total = Number(headers.get('x-wp-total') || items.length)
    const totalPages = Number(headers.get('x-wp-totalpages') || 1)

    return {
      items,
      page,
      perPage,
      total,
      totalPages,
    }
  },
  60_000,
)

const cachedBlogDetail = createKeyedCache<ArticleDetailData | null>(
  async (slug, signal) => {
    const ids = await categoryIds(signal)
    if (ids.blogs) {
      const { data } = await request(
        'wp/v2/posts',
        {
          slug,
          categories: String(ids.blogs),
          _embed: 'true',
        },
        signal,
      )
      const items = array(data)
      if (items.length) return mapArticleDetail(items[0])
    }
    const fallback = await request(
      'wp/v2/posts',
      {
        slug,
        _embed: 'true',
      },
      signal,
    )
    const fallbackItems = array(fallback.data)
    if (!fallbackItems.length) return null
    return mapArticleDetail(fallbackItems[0])
  },
  60_000,
)

const cachedRelatedBlogs = createKeyedCache<Article[]>(
  async (excludeId, signal) => {
    const ids = await categoryIds(signal)
    if (!ids.blogs) return []
    const { data } = await request(
      'wp/v2/posts',
      {
        categories: String(ids.blogs),
        per_page: '4',
        exclude: excludeId,
        _embed: 'true',
      },
      signal,
    )
    const items = array(data).map(mapArticle)
    return items.slice(0, 3)
  },
  60_000,
)

export function readBlogArticles(page = 1, perPage = 12, signal?: AbortSignal) {
  return cachedBlogArticles(`${page}:${perPage}`, signal)
}

export function readBlogDetail(slug: string, signal?: AbortSignal) {
  return cachedBlogDetail(slug, signal)
}

export function readRelatedBlogs(excludeId: string, signal?: AbortSignal) {
  return cachedRelatedBlogs(excludeId, signal)
}
