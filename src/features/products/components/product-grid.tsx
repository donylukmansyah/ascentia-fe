import { useRef } from 'react'
import { SearchX } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { EmptyState } from '#/components/ui/empty-state'
import { PagePagination } from '#/components/ui/pagination'
import { QueryErrorState } from '#/components/ui/query-error-state'
import { Reveal } from '#/components/ui/reveal'
import { useLanguage } from '#/lib/i18n'

import { ProductCard } from './product-card'
import type { ProductCardData } from '../types/product'

interface ProductGridProps {
  products: ProductCardData[]
  total: number
  totalPages: number
  kicker?: string
  title?: string
  filterLabel?: string
  page: number
  searchQuery?: string
  pending?: boolean
  fetching?: boolean
  error?: boolean
  invalidCategory?: boolean
  onRetry: () => void
  pageHref: (page: number) => string
  onPageChange: (page: number) => void
  onReset: () => void
}

function ProductCardSkeleton() {
  return (
    <li
      className="flex h-full flex-col overflow-hidden rounded-[4px] border border-border bg-white animate-pulse motion-reduce:animate-none"
      aria-hidden="true"
    >
      <div className="aspect-[4/3] w-full bg-[color-mix(in_srgb,var(--primary)_8%,var(--muted))]" />
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="h-2.5 w-14 rounded bg-muted" />
          <div className="mt-2.5 h-4 w-4/5 rounded bg-muted" />
          <div className="mt-1.5 h-4 w-3/5 rounded bg-muted" />
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="size-3 rounded-full bg-muted" />
        </div>
      </div>
    </li>
  )
}

export function ProductGrid({
  products,
  total,
  totalPages,
  kicker = 'All products',
  title = 'Browse by brand',
  filterLabel,
  page,
  searchQuery,
  pending = false,
  fetching = false,
  error = false,
  invalidCategory = false,
  onRetry,
  onPageChange,
  pageHref,
  onReset,
}: ProductGridProps) {
  const { t } = useLanguage()
  const topRef = useRef<HTMLDivElement>(null)
  const current = Math.min(Math.max(page, 1), Math.max(1, totalPages))
  const goTo = (next: number) => {
    if (fetching) return
    onPageChange(Math.min(Math.max(next, 1), Math.max(1, totalPages)))
    topRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    })
  }

  return (
    <div ref={topRef} aria-busy={fetching} className="min-w-0 scroll-mt-28">
      <Reveal variant="up" distance={20} margin="0px 0px -40px 0px">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-kicker">{kicker}</p>
            <h2 className="section-title mt-2">{title}</h2>
          </div>
          <p
            role="status"
            aria-live="polite"
            className="pt-1 text-xs whitespace-nowrap text-muted-foreground sm:text-sm"
          >
            {pending ? (
              <span className="sr-only">{t('ui.loadingProducts')}</span>
            ) : (
              `${total} ${t('ui.productCount')}`
            )}
          </p>
        </div>
      </Reveal>
      {pending ? (
        <div role="status">
          <span className="sr-only">{t('ui.loadingProducts')}</span>
          <ul
            aria-hidden="true"
            className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4"
          >
            {Array.from({ length: 8 }, (_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </ul>
        </div>
      ) : error ? (
        <QueryErrorState
          title={t('ui.productsError')}
          message={t('ui.connectionError')}
          onRetry={onRetry}
          isRetrying={fetching}
          className="mt-8"
        />
      ) : !invalidCategory && page > Math.max(1, totalPages) ? (
        <div
          role="status"
          className="mt-8 rounded-lg border border-border bg-white p-8"
        >
          <p className="font-semibold">{t('ui.pageUnavailable')}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 cursor-pointer"
            onClick={() => onPageChange(1)}
          >
            {t('ui.firstPage')}
          </Button>
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={SearchX}
          title={invalidCategory ? t('ui.filterUnavailable') : t('ui.noProducts')}
          message={
            searchQuery ? (
              <>
                {t('ui.noMatchingResults')} &ldquo;
                <span className="font-medium text-foreground">
                  {searchQuery}
                </span>
                &rdquo;.
              </>
            ) : (
              <>
                {t('ui.tryFilter')} {filterLabel ? `(${filterLabel})` : ''}
              </>
            )
          }
          action={
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="cursor-pointer"
            >
              {t('ui.resetFilters')}
            </Button>
          }
        />
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <li key={product.id} className="min-w-0">
              <Reveal
                variant="up"
                distance={24}
                duration={0.45}
                margin="0px 0px -40px 0px"
                delay={(index % 4) * 0.05}
                className="h-full"
              >
                <ProductCard product={product} className="h-full" />
              </Reveal>
            </li>
          ))}
        </ul>
      )}
      {!error && page <= Math.max(1, totalPages) && totalPages > 1 && (
        <PagePagination
          page={current}
          totalPages={totalPages}
          disabled={fetching}
          onPageChange={goTo}
          pageHref={pageHref}
          className="mt-10"
        />
      )}
    </div>
  )
}
