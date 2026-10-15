import { createFileRoute } from '@tanstack/react-router'

import { ContactPage } from '#/features/contact/pages/contact-page'

export const Route = createFileRoute('/contact-us')({
  head: () => ({
    meta: [
      { title: 'Contact Us | Ascentia Arsya Analitika' },
      {
        name: 'description',
        content:
          'Contact Ascentia for analytical instruments, technical support, seminars, and training.',
      },
    ],
  }),
  component: ContactPage,
})
