import { createFileRoute } from '@tanstack/react-router'

import { TypesPage } from '#/features/products/pages/taxonomy-pages'

export const Route = createFileRoute('/products/types')({
  component: TypesPage,
})
