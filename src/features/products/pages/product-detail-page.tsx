import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import { getProductDetail } from '../constants/products'
import { ProductDetailContent } from '../components/product-detail-content'
import { ProductDetailHero } from '../components/product-detail-hero'
import { ProductDetailNav } from '../components/product-detail-nav'
import type { ProductDetailTab } from '../components/product-detail-nav'
import { RelatedProductsSection } from '../components/related-products-section'

interface ProductDetailPageProps {
  slug: string
}

export function ProductDetailPage({ slug }: ProductDetailPageProps) {
  const product = getProductDetail(slug)
  const [activeTab, setActiveTab] = useState<ProductDetailTab>('description')

  if (!product) {
    return (
      <section className="mx-auto flex min-h-[50vh] max-w-7xl flex-col justify-center px-5 py-32 sm:px-8 lg:px-12">
        <p className="text-[11px] font-bold tracking-[0.1em] text-primary uppercase">
          Product catalog
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-foreground">
          Product not found
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-description-text">
          This product is not available in the current catalog.
        </p>
        <Link
          to="/products"
          className="mt-8 inline-flex w-fit cursor-pointer text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Browse products
        </Link>
      </section>
    )
  }

  return (
    <>
      <ProductDetailHero product={product} />
      <ProductDetailNav onTabChange={setActiveTab} />
      <ProductDetailContent
        product={product}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <RelatedProductsSection product={product} />
    </>
  )
}
