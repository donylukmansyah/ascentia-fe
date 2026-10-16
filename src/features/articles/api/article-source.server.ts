import { createKeyedCache } from '#/lib/cache'

import {
  array,
  mapArticle,
  mapArticleDetail,
  mapSearchArticle,
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

// Category 117 is Featured Events.
const cachedFeaturedEvents = createKeyedCache<NewsListingData>(
  async (_key, signal) => {
    const { data } = await request(
      'wp/v2/posts',
      {
        categories: '117',
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

// Category 19 is News.
const cachedLatestNews = createKeyedCache<LatestNewsData>(
  async (key, signal) => {
    const [pageStr, perPageStr] = key.split(':')
    const page = Number(pageStr) || 1
    const perPage = Number(perPageStr) || 4
    const { data, headers } = await request(
      'wp/v2/posts',
      {
        categories: '19',
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

// Popular news.
const cachedPopularNews = createKeyedCache<Article[]>(async (_key, signal) => {
  const { data } = await request(
    'wp/v2/posts',
    {
      categories: '19',
      per_page: '4',
      _embed: 'true',
    },
    signal,
  )
  const items = array(data).map(mapArticle)
  return items.slice(0, 4)
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
    const { data } = await request(
      'wp/v2/posts',
      {
        categories: '19,117',
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
    const { data } = await request(
      'wp/v2/posts',
      {
        search: query,
        categories: category === 'news' ? '19' : '20',
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

// Category 20 is Blogs.
const cachedBlogArticles = createKeyedCache<BlogListingData>(
  async (key, signal) => {
    const [pageStr, perPageStr] = key.split(':')
    const page = Number(pageStr) || 1
    const perPage = Number(perPageStr) || 12
    const { data, headers } = await request(
      'wp/v2/posts',
      {
        categories: '20',
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
    const { data } = await request(
      'wp/v2/posts',
      {
        slug,
        categories: '20',
        _embed: 'true',
      },
      signal,
    )
    const items = array(data)
    if (!items.length) {
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
    }
    return mapArticleDetail(items[0])
  },
  60_000,
)

const cachedRelatedBlogs = createKeyedCache<Article[]>(
  async (excludeId, signal) => {
    const { data } = await request(
      'wp/v2/posts',
      {
        categories: '20',
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
