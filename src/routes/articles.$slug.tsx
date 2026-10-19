import { createFileRoute, isRedirect, redirect } from '@tanstack/react-router'

import { getBlogDetail } from '#/features/articles/api/article-api'

export const Route = createFileRoute('/articles/$slug')({
  beforeLoad: async ({ params }) => {
    try {
      const blog = await getBlogDetail({ data: params.slug })
      if (blog && blog.categories?.some((cat) => cat.id === 20)) {
        throw redirect({
          to: '/blogs/$slug',
          statusCode: 301,
          params: { slug: params.slug },
        })
      }
    } catch (error) {
      if (isRedirect(error)) throw error
    }

    throw redirect({
      to: '/news/$slug',
      statusCode: 301,
      params: { slug: params.slug },
    })
  },
})
