import { createFileRoute } from '@tanstack/react-router'

import { BlogsPage } from '#/features/articles/pages/blogs-page'

export const Route = createFileRoute('/blogs')({
  head: () => ({
    meta: [
      { title: 'Our Blogs | Ascentia Arsya Analitika' },
      {
        name: 'description',
        content:
          'Practical guides and insights on analytical instruments, sample preparation, and laboratory workflows.',
      },
    ],
  }),
  component: BlogsPage,
})
