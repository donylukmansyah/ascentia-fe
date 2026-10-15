import { createFileRoute } from '@tanstack/react-router'

import { AboutPage } from '#/features/about/pages/about-page'

export const Route = createFileRoute('/about-us')({
  head: () => ({
    meta: [
      { title: 'About Us | Ascentia Arsya Analitika' },
      {
        name: 'description',
        content:
          'Innovative analytical technologies and first-rate support for laboratories and industry.',
      },
    ],
  }),
  component: AboutPage,
})
