import { createFileRoute } from '@tanstack/react-router'

import { NotFoundPage } from '#/components/layout/not-found-page'

export const Route = createFileRoute('/$')({
  head: () => ({
    meta: [
      { title: '404 - Not Found | Ascentia Arsya Analitika' },
      {
        name: 'description',
        content: 'The page you are looking for could not be found.',
      },
    ],
  }),
  component: NotFoundPage,
})
