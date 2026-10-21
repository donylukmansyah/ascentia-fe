import { createFileRoute } from '@tanstack/react-router'

import { ContactPage } from '#/features/contact/pages/contact-page'
import { createSeoMeta } from '#/lib/seo'

export const Route = createFileRoute('/contact-us')({
  head: () =>
    createSeoMeta({
      title: 'Contact Us | Ascentia Arsya Analitika',
      description:
        'Instrument selection, method support, and after-sales service for laboratories across Indonesia.',
      path: '/contact-us',
    }),
  component: ContactPage,
})
