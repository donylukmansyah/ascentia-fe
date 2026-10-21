import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useHydrated } from '@tanstack/react-router'

import { RouteLoading } from '#/components/layout/route-loading'
import { Button } from '#/components/ui/button'
import {
  productDetailQueryOptions,
  relatedProductsQueryOptions,
} from '../api/product-queries'
import { ProductDetailContent } from '../components/product-detail-content'
import { ProductDetailHero } from '../components/product-detail-hero'
import { ProductDetailNav } from '../components/product-detail-nav'
import {
  RelatedProductsLoading,
  RelatedProductsSection,
} from '../components/related-products-section'
import { useLanguage } from '#/lib/i18n'
import type {
  ProductDetailData,
  ProductDetailSection,
  ProductDetailTab,
} from '../types/product'

export function ProductDetailPage({ slug }: { slug: string }) {
  const query = useQuery(productDetailQueryOptions(slug))
  if (query.isPending) return <RouteLoading />
  if (query.isError)
    return <ProductDetailError onRetry={() => void query.refetch()} />
  if (!query.data) return <ProductNotFound />
  return <ProductDetailView key={slug} product={query.data} />
}

function ProductDetailView({ product }: { product: ProductDetailData }) {
  const { pick, t } = useLanguage()
  const hydrated = useHydrated()
  const [selectedTab, setSelectedTab] =
    useState<ProductDetailTab>('description')
  const displaySpecs = pick(
    { id: product.specificationsHtml, en: product.specificationsHtmlEn },
    product.specificationsHtml,
  )
  const displayApps = pick(
    { id: product.applicationsHtml, en: product.applicationsHtmlEn },
    product.applicationsHtml,
  )
  const tabs: ProductDetailSection[] = [
    { id: 'description', label: t('products.overview', 'Description') },
    ...(displaySpecs
      ? [
          {
            id: 'specifications' as const,
            label: t('products.specifications', 'Specifications'),
          },
        ]
      : []),
    ...(displayApps
      ? [
          {
            id: 'applications' as const,
            label: t('products.applications', 'Applications'),
          },
        ]
      : []),
  ]
  const activeTab = tabs.some((tab) => tab.id === selectedTab)
    ? selectedTab
    : 'description'
  const related = useQuery({
    ...relatedProductsQueryOptions(product.id, product.brandId),
    enabled: product.brandId !== '',
  })
  useEffect(() => {
    let frame = 0
    const selectHash = () => {
      const hash = window.location.hash.slice(1)
      if (
        hash !== 'description' &&
        hash !== 'specifications' &&
        hash !== 'applications'
      )
        return
      const available =
        hash === 'description' ||
        (hash === 'specifications' && product.specificationsHtml) ||
        (hash === 'applications' && product.applicationsHtml)
      const tab = available ? hash : 'description'
      setSelectedTab(tab)
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        document.getElementById(tab)?.scrollIntoView({ block: 'start' })
      })
    }
    selectHash()
    window.addEventListener('hashchange', selectHash)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('hashchange', selectHash)
    }
  }, [product.specificationsHtml, product.applicationsHtml])
  return (
    <>
      <ProductDetailHero product={product} />
      <ProductDetailNav
        onTabChange={setSelectedTab}
        tabs={tabs}
        hasRelated={hydrated && Boolean(related.data?.length)}
      />
      <ProductDetailContent
        product={product}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setSelectedTab}
      />
      {!hydrated || related.isPending ? (
        <RelatedProductsLoading />
      ) : related.isError ? (
        <div role="alert" className="mx-auto max-w-7xl px-5 py-8">
          <p>
            {t('products.relatedError', 'Unable to load related products.')}
          </p>
          <Button
            className="mt-3 cursor-pointer"
            variant="outline"
            onClick={() => void related.refetch()}
          >
            {t('common.tryAgain', 'Try again')}
          </Button>
        </div>
      ) : (
        <RelatedProductsSection products={related.data} />
      )}
    </>
  )
}

export function ProductDetailError({ onRetry }: { onRetry: () => void }) {
  const { t } = useLanguage()
  return (
    <section role="alert" className="mx-auto min-h-[50vh] max-w-7xl px-5 py-36">
      <h1 className="text-3xl font-bold">
        {t('products.loadError', 'Unable to load product')}
      </h1>
      <p className="mt-4 text-description-text">
        {t(
          'ui.connectionError',
          'We are having trouble reaching the server. Please try again.',
        )}
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-6 cursor-pointer"
        onClick={onRetry}
      >
        {t('common.tryAgain', 'Try again')}
      </Button>
    </section>
  )
}

export function ProductNotFound() {
  const { t } = useLanguage()
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-7xl flex-col justify-center px-5 py-32 sm:px-8 lg:px-12">
      <p className="text-[11px] font-bold tracking-[0.1em] text-primary uppercase">
        {t('products.catalog', 'Product catalog')}
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em]">
        {t('products.notFound', 'Product not found')}
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-description-text">
        {t(
          'products.notFoundDescription',
          'This product is not available in the current catalog.',
        )}
      </p>
      <Link
        to="/products"
        className="mt-8 w-fit cursor-pointer text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        {t('ui.browseProducts', 'Browse products')}
      </Link>
    </section>
  )
}
