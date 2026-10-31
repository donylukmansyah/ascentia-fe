import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useHydrated } from '@tanstack/react-router'
import { AlertCircle, PackageSearch } from 'lucide-react'

import { RouteLoading } from '#/components/layout/route-loading'
import { CtaButton, CtaLink } from '#/components/ui/cta-link'
import { PageStatus } from '#/components/ui/page-status'
import { QueryErrorState } from '#/components/ui/query-error-state'
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
        <div className="mx-auto max-w-7xl px-5 py-8">
          <QueryErrorState
            title={t('products.relatedError', 'Unable to load related products.')}
            message={t('ui.connectionError')}
            onRetry={() => void related.refetch()}
            isRetrying={related.isFetching}
          />
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
    <PageStatus
      role="alert"
      headingId="product-error-heading"
      icon={AlertCircle}
      title={t('products.loadError', 'Unable to load product')}
      description={t(
        'ui.connectionError',
        'We are having trouble reaching the server. Please try again.',
      )}
    >
      <CtaButton onClick={onRetry}>
        {t('common.tryAgain', 'Try again')}
      </CtaButton>
      <Link
        to="/products"
        className="inline-flex cursor-pointer items-center text-sm font-semibold text-description-text underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        {t('ui.browseProducts', 'Browse products')}
      </Link>
    </PageStatus>
  )
}

export function ProductNotFound() {
  const { t } = useLanguage()
  return (
    <PageStatus
      headingId="product-not-found-heading"
      icon={PackageSearch}
      title={t('products.notFound', 'Product not found')}
      description={t(
        'products.notFoundDescription',
        'This product is not available in the current catalog.',
      )}
    >
      <CtaLink to="/products">
        {t('ui.browseProducts', 'Browse products')}
      </CtaLink>
    </PageStatus>
  )
}
