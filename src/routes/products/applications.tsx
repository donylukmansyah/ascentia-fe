import { createFileRoute } from '@tanstack/react-router'

import { ApplicationsPage } from '#/features/products/pages/taxonomy-pages'

export const Route = createFileRoute('/products/applications')({
  component: ApplicationsPage,
})
