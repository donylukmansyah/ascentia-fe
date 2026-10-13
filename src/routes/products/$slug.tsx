import { createFileRoute } from '@tanstack/react-router'

import { ProductDetailPage } from '#/features/products/pages/product-detail-page'

export const Route = createFileRoute('/products/$slug')({
  component: ProductDetailRoute,
})

function ProductDetailRoute() {
  const { slug } = Route.useParams()

  return <ProductDetailPage slug={slug} />
}
