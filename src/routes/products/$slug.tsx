import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, notFound } from '@tanstack/react-router'

import {
  productDetailQueryOptions,
  relatedProductsQueryOptions,
} from '#/features/products/api/product-queries'
import { RouteLoading } from '#/components/layout/route-loading'
import {
  ProductDetailPage,
  ProductDetailError,
  ProductNotFound,
} from '#/features/products/pages/product-detail-page'
import { createSeoMeta } from '#/lib/seo'

export const Route = createFileRoute('/products/$slug')({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(
      productDetailQueryOptions(params.slug),
    )
    if (!product) throw notFound()
    void context.queryClient
      .ensureQueryData(relatedProductsQueryOptions(product.id, product.brandId))
      .catch(() => undefined)
    return {
      title: product.name,
      description: product.summaryHtml
        ? product.summaryHtml.replace(/<[^>]*>/g, '').trim()
        : 'Analytical instrument from Ascentia Arsya Analitika.',
      image: product.image,
      imageAlt: product.imageAlt ?? product.name,
      slug: params.slug,
    }
  },
  head: ({ loaderData }) =>
    createSeoMeta({
      title: `${loaderData?.title ?? 'Product'} | Ascentia Arsya Analitika`,
      description: loaderData?.description,
      path: `/products/${loaderData?.slug ?? ''}`,
      image: loaderData?.image,
      imageAlt: loaderData?.imageAlt,
    }),
  component: ProductDetailRoute,
  pendingComponent: RouteLoading,
  errorComponent: ProductDetailErrorRoute,
  notFoundComponent: ProductNotFound,
})

function ProductDetailRoute() {
  const { slug } = Route.useParams()
  return <ProductDetailPage slug={slug} />
}

function ProductDetailErrorRoute({ reset }: { reset: () => void }) {
  const queryClient = useQueryClient()
  const { slug } = Route.useParams()
  const handleRetry = () => {
    void queryClient.resetQueries({
      queryKey: ['products', 'detail', slug],
    })
    reset()
  }
  return <ProductDetailError onRetry={handleRetry} />
}
