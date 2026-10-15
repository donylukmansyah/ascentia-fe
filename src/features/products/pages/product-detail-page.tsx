import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { RouteLoading } from '#/components/layout/route-loading'
import { Button } from '#/components/ui/button'
import {
  productDetailQueryOptions,
  relatedProductsQueryOptions,
} from '../api/product-queries'
import { ProductDetailContent } from '../components/product-detail-content'
import { ProductDetailHero } from '../components/product-detail-hero'
import { ProductDetailNav } from '../components/product-detail-nav'
import type { ProductDetailTab } from '../components/product-detail-nav'
import {
  RelatedProductsLoading,
  RelatedProductsSection,
} from '../components/related-products-section'
import type { ProductDetailData } from '../types/product'

export function ProductDetailPage({ slug }: { slug: string }) {
  const query = useQuery(productDetailQueryOptions(slug))
  if (query.isPending) return <RouteLoading />
  if (query.isError)
    return <ProductDetailError onRetry={() => void query.refetch()} />
  if (!query.data) return <ProductNotFound />
  return <ProductDetailView key={slug} product={query.data} />
}

function ProductDetailView({ product }: { product: ProductDetailData }) {
  const [activeTab, setActiveTab] = useState<ProductDetailTab>('description')
  const related = useQuery({
    ...relatedProductsQueryOptions(product.id, product.brandId),
    enabled: product.brandId !== '',
  })
  useEffect(() => {
    if (
      window.location.hash === '#specifications' &&
      product.specificationsHtml
    )
      setActiveTab('specifications')
  }, [product.specificationsHtml])
  useEffect(() => {
    if (!product.specificationsHtml && activeTab === 'specifications')
      setActiveTab('description')
  }, [product.specificationsHtml, activeTab])
  return (
    <>
      <ProductDetailHero product={product} />
      <ProductDetailNav
        onTabChange={setActiveTab}
        hasSpecifications={Boolean(product.specificationsHtml)}
        hasRelated={Boolean(related.data?.length)}
      />
      <ProductDetailContent
        product={product}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {related.isPending && <RelatedProductsLoading />}
      {related.isError ? (
        <div role="alert" className="mx-auto max-w-7xl px-5 py-8">
          <p>Unable to load related products.</p>
          <Button
            className="mt-3 cursor-pointer"
            variant="outline"
            onClick={() => void related.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : (
        <RelatedProductsSection products={related.data ?? []} />
      )}
    </>
  )
}

export function ProductDetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <section role="alert" className="mx-auto min-h-[50vh] max-w-7xl px-5 py-36">
      <h1 className="text-3xl font-bold">Unable to load product</h1>
      <p className="mt-4 text-description-text">Please try again.</p>
      <Button
        type="button"
        variant="outline"
        className="mt-6 cursor-pointer"
        onClick={onRetry}
      >
        Try again
      </Button>
    </section>
  )
}

export function ProductNotFound() {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-7xl flex-col justify-center px-5 py-32 sm:px-8 lg:px-12">
      <p className="text-[11px] font-bold tracking-[0.1em] text-primary uppercase">
        Product catalog
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em]">
        Product not found
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-description-text">
        This product is not available in the current catalog.
      </p>
      <Link
        to="/products"
        className="mt-8 w-fit cursor-pointer text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        Browse products
      </Link>
    </section>
  )
}
