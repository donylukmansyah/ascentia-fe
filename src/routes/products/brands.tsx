import { createFileRoute } from '@tanstack/react-router'

import { BrandsPage } from '#/features/products/pages/brands-page'

export const Route = createFileRoute('/products/brands')({
  component: BrandsPage,
})
