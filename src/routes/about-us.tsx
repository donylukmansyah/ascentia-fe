import { createFileRoute } from '@tanstack/react-router'

import { AboutPage } from '#/features/about/pages/about-page'
import { createSeoMeta } from '#/lib/seo'

export const Route = createFileRoute('/about-us')({
  head: () =>
    createSeoMeta({
      title: 'About Us | Ascentia Arsya Analitika',
      description:
        'Innovative analytical technologies and first-rate support for laboratories and industry.',
      path: '/about-us',
    }),
  component: AboutPage,
})
