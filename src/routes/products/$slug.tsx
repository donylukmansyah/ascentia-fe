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
import { breadcrumbSchema, createSeoMeta, toAbsoluteUrl } from '#/lib/seo'

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
      description:
        product.seo?.description ||
        'Analytical instrument from Ascentia Arsya Analitika.',
      seo: product.seo,
      brand: product.brand,
      image: product.image,
      imageAlt: product.imageAlt ?? product.name,
      slug: params.slug,
    }
  },
  head: ({ loaderData }) =>
    createSeoMeta({
      title: `${loaderData?.title ?? 'Product'} | Ascentia Arsya Analitika`,
      seo: loaderData?.seo,
      robots: loaderData ? undefined : 'noindex, follow',
      description: loaderData?.description,
      path: loaderData ? `/products/${loaderData.slug}` : undefined,
      image: loaderData?.image,
      imageAlt: loaderData?.imageAlt,
      schema: loaderData
        ? [
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products/brands' },
              { name: loaderData.title, path: `/products/${loaderData.slug}` },
            ]),
            {
              '@type': 'Product',
              name: loaderData.title,
              description:
                loaderData.seo?.description || loaderData.description,
              url: toAbsoluteUrl(`/products/${loaderData.slug}`),
              ...(loaderData.image
                ? { image: toAbsoluteUrl(loaderData.image) }
                : {}),
              ...(loaderData.brand !== 'Product'
                ? { brand: { '@type': 'Brand', name: loaderData.brand } }
                : {}),
            },
          ]
        : [],
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
