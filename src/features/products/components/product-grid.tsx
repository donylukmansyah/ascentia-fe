import { useRef } from 'react'

import { Button } from '#/components/ui/button'
import { PagePagination } from '#/components/ui/pagination'

import { ProductCard } from './product-card'
import type { ProductCardData } from '../types/product'

interface ProductGridProps {
  products: ProductCardData[]
  kicker?: string
  title?: string
  filterLabel?: string
  page: number
  pageSize?: number
  onPageChange: (page: number) => void
  onReset: () => void
}

export function ProductGrid({
  products,
  kicker = 'All products',
  title = 'Browse by brand',
  filterLabel = 'brand',
  page,
  pageSize = 8,
  onPageChange,
  onReset,
}: ProductGridProps) {
  const topRef = useRef<HTMLDivElement>(null)
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize))
  const current = Math.min(Math.max(page, 1), totalPages)
  const visible = products.slice((current - 1) * pageSize, current * pageSize)

  const goTo = (next: number) => {
    onPageChange(Math.min(Math.max(next, 1), totalPages))
    // Paged content starts below the fold on mobile.
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={topRef} className="min-w-0 scroll-mt-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.08em] text-primary uppercase sm:text-xs">
            {kicker}
          </p>
          <h2 className="mt-1 text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-bold tracking-[-0.03em] text-foreground">
            {title}
          </h2>
        </div>
        <p className="pt-1 text-xs whitespace-nowrap text-muted-foreground sm:text-sm">
          {products.length} products
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-lg border border-border bg-white px-6 py-16 text-center">
          <p className="text-base font-semibold text-foreground">
            No products found
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
          {visible.map((product) => (
            <li key={product.id} className="min-w-0">
              <ProductCard product={product} className="h-full" />
            </li>
          ))}
        </ul>
      )}

      <PagePagination
        page={current}
        totalPages={totalPages}
        onPageChange={goTo}
        className="mt-10"
      />
    </div>
  )
}
