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
    page: Math.max(1, Math.trunc(Number(search.page) || 1)),
  }),
  search: {
    middlewares: [stripSearchParams({ page: 1 })],
  },
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ context, deps: { page } }) => {
    await context.queryClient
      .ensureQueryData(blogArticlesQueryOptions(page, BLOG_LIST_PAGE_SIZE))
      .catch(() => undefined)
  },
  head: () =>
    createSeoMeta({
      title: 'Our Blogs | Ascentia Arsya Analitika',
      description:
        'Practical guides and insights on analytical instruments, sample preparation, and laboratory workflows.',
      path: '/blogs',
    }),
  component: BlogsPage,
  pendingComponent: RouteLoading,
})
