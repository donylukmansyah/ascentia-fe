import { createFileRoute } from '@tanstack/react-router'

import { ContactPage } from '#/features/contact/pages/contact-page'
import { createSeoMeta } from '#/lib/seo'

export const Route = createFileRoute('/contact-us')({
  head: () =>
    createSeoMeta({
      title: 'Contact Us | Ascentia Arsya Analitika',
      description:
        'Contact Ascentia for analytical instruments, technical support, seminars, and training.',
      path: '/contact-us',
    }),
  component: ContactPage,
})
