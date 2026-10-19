import { createFileRoute, notFound } from '@tanstack/react-router'

import { NotFoundPage } from '#/components/layout/not-found-page'
import { createSeoMeta } from '#/lib/seo'

export const Route = createFileRoute('/$')({
  beforeLoad: () => {
    throw notFound()
  },
  notFoundComponent: NotFoundPage,
  head: () =>
    createSeoMeta({
      title: '404 - Not Found | Ascentia Arsya Analitika',
      robots: 'noindex, follow',
      description: 'The page you are looking for could not be found.',
    }),
  component: NotFoundPage,
})
