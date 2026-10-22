import { createFileRoute, stripSearchParams } from '@tanstack/react-router'

import { RouteLoading } from '#/components/layout/route-loading'
import {
  BLOG_LIST_PAGE_SIZE,
  blogArticlesQueryOptions,
} from '#/features/articles/api/article-queries'
import { BlogsPage } from '#/features/articles/pages/blogs-page'
import { createSeoMeta } from '#/lib/seo'

interface BlogSearch {
  page: number
}

export const Route = createFileRoute('/blogs/')({
  validateSearch: (search: Record<string, unknown>): BlogSearch => ({
    page:
      Number.isSafeInteger(Number(search.page)) && Number(search.page) > 0
        ? Number(search.page)
        : 1,
  }),
  search: {
    middlewares: [stripSearchParams({ page: 1 })],
  },
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ context, deps: { page } }) => {
    const data = await context.queryClient
      .ensureQueryData(blogArticlesQueryOptions(page, BLOG_LIST_PAGE_SIZE))
      .catch(() => undefined)
    return { page, unavailable: !data || page > Math.max(1, data.totalPages) }
  },
  head: ({ loaderData }) =>
    createSeoMeta({
      title: `Blogs | Ascentia Arsya Analitika${loaderData && loaderData.page > 1 ? ` | Page ${loaderData.page}` : ''}`,
      robots: loaderData?.unavailable ? 'noindex, follow' : undefined,
      description:
        'Practical guides, method comparisons, and notes from laboratory work.',
      path: `/blogs${loaderData && loaderData.page > 1 ? `?page=${loaderData.page}` : ''}`,
    }),
  component: BlogsPage,
  pendingComponent: RouteLoading,
})
