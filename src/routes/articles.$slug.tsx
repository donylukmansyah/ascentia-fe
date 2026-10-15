import { createFileRoute, notFound } from '@tanstack/react-router'

import {
  dummyArticles,
  dummyBlogs,
} from '#/features/articles/constants/dummy-articles'
import {
  ArticleDetailPage,
  ArticleNotFoundPage,
} from '#/features/articles/pages/article-detail-page'

export const Route = createFileRoute('/articles/$slug')({
  loader: ({ params }) => {
    const blog = dummyBlogs.find((item) => item.slug === params.slug)
    const article =
      blog ?? dummyArticles.find((item) => item.slug === params.slug)
    if (!article) throw notFound()
    const backTo: '/blogs' | '/news' = blog ? '/blogs' : '/news'
    return { article, backTo }
  },
  head: ({ loaderData }) => {
    const article = loaderData?.article
    const title = `${article?.title.replace(/\.$/, '') ?? 'Article'} | Ascentia Arsya Analitika`
    return {
      meta: article
        ? [{ title }, { name: 'description', content: article.excerpt }]
        : [{ title }],
    }
  },
  component: ArticleDetailRoute,
  notFoundComponent: ArticleNotFoundPage,
})

function ArticleDetailRoute() {
  return <ArticleDetailPage {...Route.useLoaderData()} />
}
