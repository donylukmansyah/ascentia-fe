import { queryOptions } from '@tanstack/react-query'

import { retryWordPressQuery } from '#/lib/wordpress-query'
import {
  getBlogArticles,
  getBlogDetail,
  getFeaturedEvents,
  getLatestNews,
  getNewsDetail,
  getPopularNews,
  getRelatedBlogs,
  getRelatedNews,
} from './article-api'

export function featuredEventsQueryOptions() {
  return queryOptions({
    queryKey: ['news', 'featured'],
    retry: retryWordPressQuery,
    queryFn: ({ signal }) => getFeaturedEvents({ signal }),
    staleTime: 60_000,
  })
}

export function popularNewsQueryOptions() {
  return queryOptions({
    queryKey: ['news', 'popular'],
    retry: retryWordPressQuery,
    queryFn: ({ signal }) => getPopularNews({ signal }),
    staleTime: 60_000,
  })
}

export const NEWS_LATEST_PAGE_SIZE = 4

export function latestNewsQueryOptions(
  page = 1,
  perPage = NEWS_LATEST_PAGE_SIZE,
) {
  return queryOptions({
    queryKey: ['news', 'latest', { page, perPage }],
    retry: retryWordPressQuery,
    queryFn: ({ signal }) => getLatestNews({ data: { page, perPage }, signal }),
    staleTime: 60_000,
  })
}

export function newsDetailQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ['news', 'detail', slug],
    retry: retryWordPressQuery,
    queryFn: ({ signal }) => getNewsDetail({ data: slug, signal }),
    staleTime: 60_000,
  })
}

export function relatedNewsQueryOptions(excludeId: string) {
  return queryOptions({
    queryKey: ['news', 'related', excludeId],
    retry: retryWordPressQuery,
    queryFn: ({ signal }) => getRelatedNews({ data: excludeId, signal }),
    staleTime: 60_000,
  })
}

export const BLOG_LIST_PAGE_SIZE = 12

export function blogArticlesQueryOptions(
  page = 1,
  perPage = BLOG_LIST_PAGE_SIZE,
) {
  return queryOptions({
    queryKey: ['blogs', 'list', { page, perPage }],
    retry: retryWordPressQuery,
    queryFn: ({ signal }) =>
      getBlogArticles({ data: { page, perPage }, signal }),
    staleTime: 60_000,
  })
}

export function blogDetailQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ['blogs', 'detail', slug],
    retry: retryWordPressQuery,
    queryFn: ({ signal }) => getBlogDetail({ data: slug, signal }),
    staleTime: 60_000,
  })
}

export function relatedBlogsQueryOptions(excludeId: string) {
  return queryOptions({
    queryKey: ['blogs', 'related', excludeId],
    retry: retryWordPressQuery,
    queryFn: ({ signal }) => getRelatedBlogs({ data: excludeId, signal }),
    staleTime: 60_000,
  })
}
