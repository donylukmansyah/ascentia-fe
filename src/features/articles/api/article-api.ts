import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

export const getFeaturedEvents = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { readFeaturedEvents } = await import('./article-source.server')
    return readFeaturedEvents(getRequest().signal)
  },
)

export const getPopularNews = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { readPopularNews } = await import('./article-source.server')
    return readPopularNews(getRequest().signal)
  },
)

export const getLatestNews = createServerFn({ method: 'GET' })
  .validator((data: { page?: number; perPage?: number } | undefined) => ({
    page: Math.max(1, Math.trunc(Number(data?.page) || 1)),
    perPage: Math.min(100, Math.max(1, Math.trunc(Number(data?.perPage) || 4))),
  }))
  .handler(async ({ data }) => {
    const { readLatestNews } = await import('./article-source.server')
    return readLatestNews(data.page, data.perPage, getRequest().signal)
  })

export const getNewsDetail = createServerFn({ method: 'GET' })
  .validator((slug: unknown) => {
    if (typeof slug !== 'string' || !slug.trim()) {
      throw new Error('Invalid article slug')
    }
    return slug.trim()
  })
  .handler(async ({ data: slug }) => {
    const { readNewsDetail } = await import('./article-source.server')
    return readNewsDetail(slug, getRequest().signal)
  })

export const getRelatedNews = createServerFn({ method: 'GET' })
  .validator((excludeId: unknown) => {
    if (typeof excludeId !== 'string' && typeof excludeId !== 'number') {
      throw new Error('Invalid article ID')
    }
    return String(excludeId)
  })
  .handler(async ({ data: excludeId }) => {
    const { readRelatedNews } = await import('./article-source.server')
    return readRelatedNews(excludeId, getRequest().signal)
  })

export const getBlogArticles = createServerFn({ method: 'GET' })
  .validator((data: { page?: number; perPage?: number } | undefined) => ({
    page: Math.max(1, Math.trunc(Number(data?.page) || 1)),
    perPage: Math.min(48, Math.max(1, Math.trunc(Number(data?.perPage) || 12))),
  }))
  .handler(async ({ data }) => {
    const { readBlogArticles } = await import('./article-source.server')
    return readBlogArticles(data.page, data.perPage, getRequest().signal)
  })

export const getBlogDetail = createServerFn({ method: 'GET' })
  .validator((slug: unknown) => {
    if (typeof slug !== 'string' || !slug.trim()) {
      throw new Error('Invalid article slug')
    }
    return slug.trim()
  })
  .handler(async ({ data: slug }) => {
    const { readBlogDetail } = await import('./article-source.server')
    return readBlogDetail(slug, getRequest().signal)
  })

export const getRelatedBlogs = createServerFn({ method: 'GET' })
  .validator((excludeId: unknown) => {
    if (typeof excludeId !== 'string' && typeof excludeId !== 'number') {
      throw new Error('Invalid article ID')
    }
    return String(excludeId)
  })
  .handler(async ({ data: excludeId }) => {
    const { readRelatedBlogs } = await import('./article-source.server')
    return readRelatedBlogs(excludeId, getRequest().signal)
  })
