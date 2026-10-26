import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound, redirect } from '@tanstack/react-router'

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
import { BLOG_CATEGORY_SLUG } from '#/features/articles/constants/categories'
import type { ArticleDetailData } from '#/features/articles/types/article'
import { breadcrumbSchema, createSeoMeta, toAbsoluteUrl } from '#/lib/seo'

export const Route = createFileRoute('/news/$slug')({
  loader: async ({ context, params }) => {
    const article = await context.queryClient.ensureQueryData(
      newsDetailQueryOptions(params.slug),
    )
    if (!article) throw notFound()
    if (
      article.categories?.some((category) => category.slug === BLOG_CATEGORY_SLUG)
    ) {
      throw redirect({ to: '/blogs/$slug', params, statusCode: 301 })
    }
    void context.queryClient
      .ensureQueryData(relatedNewsQueryOptions(article.id))
      .catch(() => undefined)
    return {
      title: article.title,
      excerpt: article.excerpt,
      image: article.image,
      alt: article.alt,
      slug: params.slug,
      seo: article.seo,
      date: article.date,
    }
  },
  head: ({ loaderData }) =>
    createSeoMeta({
      title: `${loaderData?.title ?? 'News'} | Ascentia Arsya Analitika`,
      seo: loaderData?.seo,
      robots: loaderData ? undefined : 'noindex, follow',
      description: loaderData?.excerpt,
      path: loaderData ? `/news/${loaderData.slug}` : undefined,
      image: loaderData?.image,
      imageAlt: loaderData?.alt ?? loaderData?.title,
      type: 'article',
      schema: loaderData
        ? [
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'News', path: '/news' },
              { name: loaderData.title, path: `/news/${loaderData.slug}` },
            ]),
            {
              '@type': 'Article',
              headline: loaderData.title,
              datePublished: loaderData.date,
              mainEntityOfPage: toAbsoluteUrl(`/news/${loaderData.slug}`),
              image: toAbsoluteUrl(loaderData.image),
            },
          ]
        : [],
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
