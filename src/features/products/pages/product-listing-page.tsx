import { useMemo, useState } from 'react'

import { useStickyHeader } from '#/hooks/use-sticky-header'
import { cn } from '#/lib/utils'

import { BrandFilter } from '../components/brand-filter'
import { filterProducts } from '../components/filter-products'
import { ProductCarouselSection } from '../components/product-carousel-section'
import { ProductGrid } from '../components/product-grid'
import { ProductSearchPanel } from '../components/product-search-panel'
import { ProductsHeroSection } from '../components/products-hero-section'
import type { ProductFilterField } from '../components/filter-products'
import type { ProductBrand } from '../constants/brands'
import type { ProductCardData } from '../types/product'

interface ProductListingPageProps {
  products: ProductCardData[]
  recommendations: ProductCardData[]
  options: ProductBrand[]
  field: ProductFilterField
  title: string
  label: string
}

export function ProductListingPage({
  products,
  recommendations,
  options,
  field,
  title,
  label,
}: ProductListingPageProps) {
  const [activeId, setActiveId] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const headerMode = useStickyHeader({ hideOffset: 320 })
  const headerPinned =
    headerMode !== 'hidden' && headerMode !== 'hidden-initial'
  const activeOption = options.find((option) => option.id === activeId)
  const filtered = useMemo(
    () => filterProducts(products, field, activeId, query),
    [products, field, activeId, query],
  )

  return (
    <>
      <ProductsHeroSection
        title={`All ${title}`}
        breadcrumbCurrent={title}
        exploreLabel={`Explore products by ${label}`}
        imagePositionClassName="object-[center_-120px] md:object-[center_-350px]"
      />
      <ProductSearchPanel
        value={query}
        onQueryChange={(value) => {
          setQuery(value)
          setPage(1)
        }}
      />
      <section
        id="product-results"
        aria-label={`Browse products by ${label}`}
        className="scroll-mt-24 bg-background"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 pb-16 sm:px-8 sm:pb-20 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-12">
          <BrandFilter
            brands={options}
            title={title}
            label={`Filter by ${label}`}
            activeId={activeId}
            onSelect={(id) => {
              setActiveId(id)
              setPage(1)
            }}
            className={cn(
              'min-w-0 lg:sticky lg:self-start lg:transition-[top] lg:duration-300',
              headerPinned ? 'lg:top-27' : 'lg:top-3',
            )}
          />
          <ProductGrid
            products={filtered}
            title={`Browse by ${label}`}
            filterLabel={label}
            kicker={activeOption ? activeOption.name : 'All products'}
            page={page}
            pageSize={8}
            onPageChange={setPage}
            onReset={() => {
              setActiveId('all')
              setQuery('')
              setPage(1)
            }}
          />
        </div>
      </section>
      <ProductCarouselSection
        title="Explore our recommendations"
        products={recommendations}
      />
    </>
  )
}
