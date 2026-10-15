import { useRef } from 'react'

import { Button } from '#/components/ui/button'
import { PagePagination } from '#/components/ui/pagination'

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
  pending?: boolean
  fetching?: boolean
  error?: boolean
  invalidCategory?: boolean
  onRetry: () => void
  onPageChange: (page: number) => void
  onReset: () => void
}

export function ProductGrid({
  products,
  total,
  totalPages,
  kicker = 'All products',
  title = 'Browse by brand',
  filterLabel = 'brand',
  page,
  pending = false,
  fetching = false,
  error = false,
  invalidCategory = false,
  onRetry,
  onPageChange,
  onReset,
}: ProductGridProps) {
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.08em] text-primary uppercase sm:text-xs">
            {kicker}
          </p>
          <h2 className="mt-1 text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-bold tracking-[-0.03em] text-foreground">
            {title}
          </h2>
        </div>
        <p
          role="status"
          aria-live="polite"
          className="pt-1 text-xs whitespace-nowrap text-muted-foreground sm:text-sm"
        >
          {pending
            ? `Loading page ${page}…`
            : fetching
              ? 'Updating products…'
              : `${total} products`}
        </p>
      </div>
      {pending ? (
        <div role="status">
          <span className="sr-only">Loading products…</span>
          <ul
            aria-hidden="true"
            className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4"
          >
            {Array.from({ length: 8 }, (_, index) => (
              <li
                key={index}
                className="h-72 animate-pulse rounded bg-muted motion-reduce:animate-none"
              />
            ))}
          </ul>
        </div>
      ) : error ? (
        <div role="alert" className="mt-8 border border-border p-8">
          <p>Unable to load products. Please try again.</p>
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
            className="mt-4 cursor-pointer"
          >
            Try again
          </Button>
        </div>
      ) : !invalidCategory && page > Math.max(1, totalPages) ? (
        <div
          role="status"
          className="mt-8 rounded-lg border border-border bg-white p-8"
        >
          <p className="font-semibold">This page is not available</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 cursor-pointer"
            onClick={() => onPageChange(1)}
          >
            Go to page 1
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-lg border border-border bg-white px-6 py-16 text-center">
          <p className="text-base font-semibold text-foreground">
            {invalidCategory
              ? 'This filter is no longer available'
              : 'No products found'}
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Try a different {filterLabel} or search keyword.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="mt-6 cursor-pointer"
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id} className="min-w-0">
              <ProductCard product={product} className="h-full" />
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
          className="mt-10"
        />
      )}
    </div>
  )
}
