import { useEffect, useState, useSyncExternalStore } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '#/components/ui/button'
import { useStickyHeader } from '#/hooks/use-sticky-header'
import { cn } from '#/lib/utils'

import {
  PRODUCT_LIST_PAGE_SIZE,
  featuredProductsQueryOptions,
  productsQueryOptions,
  productTaxonomiesQueryOptions,
} from '../api/product-queries'
import { BrandFilter } from '../components/brand-filter'
import { ProductCarouselSection } from '../components/product-carousel-section'
import { ProductGrid } from '../components/product-grid'
import { ProductSearchPanel } from '../components/product-search-panel'
import { ProductsHeroSection } from '../components/products-hero-section'
import type {
  ProductGroup,
  ProductListInput,
  ProductSearch,
} from '../types/product'

interface ProductListingPageProps {
  group: ProductGroup
  search: ProductSearch
  onSearchChange: (next: ProductSearch, replace?: boolean) => void
}

const subscribeToHydration = () => () => {}

const labels = {
  brands: ['Brands', 'brand'],
  types: ['Types', 'type'],
  applications: ['Applications', 'application'],
} as const

export function ProductListingPage({
  group,
  search,
  onSearchChange,
}: ProductListingPageProps) {
  const [title, label] = labels[group]
  const [draft, setDraft] = useState(search.q)
  const taxonomy = useQuery(productTaxonomiesQueryOptions())
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  )
  const featured = useQuery({
    ...featuredProductsQueryOptions(),
    enabled: hydrated,
  })
  const products = useQuery({
    ...productsQueryOptions({
      group,
      category: search.category,
      search: search.q,
      page: search.page,
      perPage: PRODUCT_LIST_PAGE_SIZE,
    }),
    placeholderData: (previousData, previousQuery) => {
      const previous = previousQuery?.queryKey[2] as
        ProductListInput | undefined
      return previous?.group === group &&
        previous.category === search.category &&
        previous.search === search.q
        ? previousData
        : undefined
    },
  })
  const headerMode = useStickyHeader()
  const headerPinned =
    headerMode !== 'hidden' && headerMode !== 'hidden-initial'
  const options = taxonomy.data?.[group] ?? []
  const active = options.find((option) => option.slug === search.category)

  useEffect(() => setDraft(search.q), [search.q])
  useEffect(() => {
    if (draft.trim() === search.q) return
    const timeout = setTimeout(
      () => onSearchChange({ ...search, q: draft.trim(), page: 1 }, true),
      300,
    )
    return () => clearTimeout(timeout)
  }, [draft, search, onSearchChange])

  const reset = () => onSearchChange({ category: '', q: '', page: 1 })

  return (
    <>
      <ProductsHeroSection
        title={`All ${title}`}
        breadcrumbCurrent={title}
        exploreLabel={`Explore products by ${label}`}
        imagePositionClassName="object-[center_-120px] md:object-[center_-350px]"
      />
      <ProductSearchPanel
        value={draft}
        onQueryChange={(value) => setDraft(value.slice(0, 200))}
        placeholder="Search products..."
      />
      <section
        id="product-results"
        aria-label={`Browse products by ${label}`}
        className="scroll-mt-24 bg-background"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 pb-16 sm:px-8 sm:pb-20 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-12">
          <div
            className={cn(
              'min-w-0 lg:sticky lg:self-start lg:transition-[top] lg:duration-300',
              headerPinned ? 'lg:top-27' : 'lg:top-3',
            )}
          >
            <BrandFilter
              brands={options}
              title={title}
              label={`Filter by ${label}`}
              activeSlug={search.category || 'all'}
              onSelect={(slug) =>
                onSearchChange({
                  ...search,
                  category: slug === 'all' ? '' : slug,
                  page: 1,
                })
              }
            />
            {taxonomy.isPending && (
              <p role="status" className="py-4 text-sm text-description-text">
                Loading filters…
              </p>
            )}
            {taxonomy.isError && (
              <div role="alert" className="py-4">
                <p className="text-sm">Unable to load filters.</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 cursor-pointer"
                  onClick={() => void taxonomy.refetch()}
                >
                  Try again
                </Button>
              </div>
            )}
          </div>
          <ProductGrid
            products={products.data?.items ?? []}
            total={products.data?.total ?? 0}
            totalPages={products.data?.totalPages ?? 0}
            title={`Browse by ${label}`}
            filterLabel={label}
            kicker={
              products.isPlaceholderData
                ? 'Updating results'
                : (active?.name ?? 'All products')
            }
            page={search.page}
            pending={products.isPending || products.isPlaceholderData}
            fetching={products.isFetching}
            error={products.isError}
            invalidCategory={products.data?.invalidCategory}
            onRetry={() => void products.refetch()}
            onPageChange={(page) => onSearchChange({ ...search, page })}
            onReset={reset}
          />
        </div>
      </section>
      <ProductCarouselSection
        title="Explore our recommendations"
        products={hydrated ? (featured.data?.items ?? []) : []}
        pending={!hydrated || featured.isPending}
        error={hydrated && featured.isError}
        retry={() => void featured.refetch()}
      />
    </>
  )
}
