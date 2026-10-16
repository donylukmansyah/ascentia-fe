import { useRef } from 'react'

import { Button } from '#/components/ui/button'
import { PagePagination } from '#/components/ui/pagination'
import { Reveal } from '#/components/ui/reveal'

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
  filterLabel = 'brand',
  page,
  searchQuery,
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
      <Reveal variant="up" distance={20} margin="0px 0px -40px 0px">
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
            {pending ? (
              <span className="sr-only">Loading products…</span>
            ) : (
              `${total} products`
            )}
          </p>
        </div>
      </Reveal>
      {pending ? (
        <div role="status">
          <span className="sr-only">Loading products…</span>
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
          {searchQuery ? (
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              No results found matching &ldquo;
              <span className="font-medium text-foreground">{searchQuery}</span>
              &rdquo;.
            </p>
          ) : (
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Try a different {filterLabel} or search keyword.
            </p>
          )}
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
          className="mt-10"
        />
      )}
    </div>
  )
}
