import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound, redirect } from '@tanstack/react-router'

import { RouteLoading } from '#/components/layout/route-loading'
import {
  blogDetailQueryOptions,
  relatedBlogsQueryOptions,
} from '#/features/articles/api/article-queries'
import {
  ArticleDetailError,
  ArticleDetailPage,
  ArticleNotFoundPage,
} from '#/features/articles/pages/article-detail-page'
import type { ArticleDetailData } from '#/features/articles/types/article'
import { breadcrumbSchema, createSeoMeta, toAbsoluteUrl } from '#/lib/seo'

export const Route = createFileRoute('/blogs/$slug')({
  loader: async ({ context, params }) => {
    const article = await context.queryClient.ensureQueryData(
      blogDetailQueryOptions(params.slug),
    )
    if (!article) throw notFound()
    if (!article.categories?.some((category) => category.id === 20)) {
      throw redirect({ to: '/news/$slug', params, statusCode: 301 })
    }
    void context.queryClient
      .ensureQueryData(relatedBlogsQueryOptions(article.id))
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
      title: `${loaderData?.title ?? 'Blog'} | Ascentia Arsya Analitika`,
      seo: loaderData?.seo,
      robots: loaderData ? undefined : 'noindex, follow',
      description: loaderData?.excerpt,
      path: loaderData ? `/blogs/${loaderData.slug}` : undefined,
      image: loaderData?.image,
      imageAlt: loaderData?.alt ?? loaderData?.title,
      type: 'article',
      schema: loaderData
        ? [
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Blogs', path: '/blogs' },
              { name: loaderData.title, path: `/blogs/${loaderData.slug}` },
            ]),
            {
              '@type': 'Article',
              headline: loaderData.title,
              datePublished: loaderData.date,
              mainEntityOfPage: toAbsoluteUrl(`/blogs/${loaderData.slug}`),
              image: toAbsoluteUrl(loaderData.image),
            },
          ]
        : [],
    }),
  component: BlogDetailRoute,
  pendingComponent: RouteLoading,
  errorComponent: BlogDetailErrorRoute,
  notFoundComponent: ArticleNotFoundPage,
})

function BlogDetailRoute() {
  const { slug } = Route.useParams()
  const { data: article } = useSuspenseQuery(blogDetailQueryOptions(slug))
  if (!article) return <ArticleNotFoundPage />
  return <BlogDetailContent article={article} />
}

function BlogDetailContent({ article }: { article: ArticleDetailData }) {
  const { data: relatedArticles = [] } = useSuspenseQuery(
    relatedBlogsQueryOptions(article.id),
  )

  return (
    <ArticleDetailPage
      article={article}
      relatedArticles={relatedArticles}
      backTo="/blogs"
    />
  )
}

function BlogDetailErrorRoute({ reset }: { reset: () => void }) {
  const queryClient = useQueryClient()
  const { slug } = Route.useParams()
  const handleRetry = () => {
    void queryClient.resetQueries({
      queryKey: ['blogs', 'detail', slug],
    })
    reset()
  }
  return <ArticleDetailError onRetry={handleRetry} />
}
