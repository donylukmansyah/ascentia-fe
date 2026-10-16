import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound } from '@tanstack/react-router'

import { RouteLoading } from '#/components/layout/route-loading'
import {
  newsDetailQueryOptions,
  relatedNewsQueryOptions,
} from '#/features/articles/api/article-queries'
import {
  ArticleDetailError,
  ArticleDetailPage,
  ArticleNotFoundPage,
} from '#/features/articles/pages/article-detail-page'
import type { ArticleDetailData } from '#/features/articles/types/article'
import { createSeoMeta } from '#/lib/seo'

export const Route = createFileRoute('/news/$slug')({
  loader: async ({ context, params }) => {
    const article = await context.queryClient.ensureQueryData(
      newsDetailQueryOptions(params.slug),
    )
    if (!article) throw notFound()
    void context.queryClient
      .ensureQueryData(relatedNewsQueryOptions(article.id))
      .catch(() => undefined)
    return {
      title: article.title,
      excerpt: article.excerpt,
      image: article.image,
      alt: article.alt,
      slug: params.slug,
    }
  },
  head: ({ loaderData }) =>
    createSeoMeta({
      title: `${loaderData?.title ?? 'News'} | Ascentia Arsya Analitika`,
      description: loaderData?.excerpt,
      path: `/news/${loaderData?.slug ?? ''}`,
      image: loaderData?.image,
      imageAlt: loaderData?.alt ?? loaderData?.title,
      type: 'article',
    }),
  component: NewsDetailRoute,
  pendingComponent: RouteLoading,
  errorComponent: NewsDetailErrorRoute,
  notFoundComponent: ArticleNotFoundPage,
})

function NewsDetailRoute() {
  const { slug } = Route.useParams()
  const { data: article } = useSuspenseQuery(newsDetailQueryOptions(slug))
  if (!article) return <ArticleNotFoundPage />
  return <NewsDetailContent article={article} />
}

function NewsDetailContent({ article }: { article: ArticleDetailData }) {
  const { data: relatedArticles = [] } = useSuspenseQuery(
    relatedNewsQueryOptions(article.id),
  )

  return (
    <ArticleDetailPage
      article={article}
      relatedArticles={relatedArticles}
      backTo="/news"
    />
  )
}

function NewsDetailErrorRoute({ reset }: { reset: () => void }) {
  const queryClient = useQueryClient()
  const { slug } = Route.useParams()
  const handleRetry = () => {
    void queryClient.resetQueries({
      queryKey: ['news', 'detail', slug],
    })
    reset()
  }
  return <ArticleDetailError onRetry={handleRetry} />
}
