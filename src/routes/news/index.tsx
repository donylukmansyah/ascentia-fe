import { createFileRoute } from '@tanstack/react-router'

import { RouteLoading } from '#/components/layout/route-loading'
import {
  featuredEventsQueryOptions,
  latestNewsQueryOptions,
  popularNewsQueryOptions,
} from '#/features/articles/api/article-queries'
import { NewsPage } from '#/features/articles/pages/news-page'
import { createSeoMeta } from '#/lib/seo'

export const Route = createFileRoute('/news/')({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient
        .ensureQueryData(featuredEventsQueryOptions())
        .catch(() => undefined),
      context.queryClient
        .ensureQueryData(popularNewsQueryOptions())
        .catch(() => undefined),
      context.queryClient
        .ensureQueryData(latestNewsQueryOptions(1, 4))
        .catch(() => undefined),
    ])
  },
  head: () =>
    createSeoMeta({
      title: 'Our News | Ascentia Arsya Analitika',
      description:
        'Company updates, events, and insights from Ascentia’s work with laboratories and industry.',
      path: '/news',
    }),
  component: NewsPage,
  pendingComponent: RouteLoading,
})
