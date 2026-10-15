import { createFileRoute } from '@tanstack/react-router'

import { NewsPage } from '#/features/articles/pages/news-page'

export const Route = createFileRoute('/news')({
  head: () => ({
    meta: [
      { title: 'Our News | Ascentia Arsya Analitika' },
      {
        name: 'description',
        content:
          'Company updates, events, and insights from Ascentia’s work with laboratories and industry.',
      },
    ],
  }),
  component: NewsPage,
})
