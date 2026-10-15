import { cn } from 'cn'

import type { ProductTaxonomy } from '../types/product'

interface BrandFilterProps {
  brands: ProductTaxonomy[]
  activeSlug: string
  onSelect: (id: string) => void
  className?: string
  title?: string
  label?: string
}

const ALL_BRAND_ID = 'all'

export function BrandFilter({
  brands,
  activeSlug,
  onSelect,
  className,
  title = 'Brands',
  label = 'Filter by brand',
}: BrandFilterProps) {
  const entries = [{ id: ALL_BRAND_ID, slug: ALL_BRAND_ID, name: 'All', logo: undefined }, ...brands]

  return (
    <div className={className}>
      <div
        role="group"
        aria-label={label}
        className="flex gap-1 overflow-x-auto border-b border-border lg:hidden"
      >
        {entries.map((brand) => (
          <button
            key={brand.id}
            type="button"
            onClick={() => onSelect(brand.slug)}
            aria-pressed={brand.slug === activeSlug}
            className={cn(
              'flex min-h-11 shrink-0 cursor-pointer items-center border-b-2 px-4 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              brand.slug === activeSlug
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground/70 hover:border-primary/40 hover:text-foreground',
            )}
          >
            {brand.name}
          </button>
        ))}
      </div>

      <aside aria-label={label} className="hidden lg:block">
        <h2 className="text-xs font-bold tracking-[0.12em] uppercase">
          {title}
        </h2>
        <ul className="mt-2">
          {entries.map((brand) => {
            const active = brand.slug === activeSlug
            const isAll = brand.id === ALL_BRAND_ID
            return (
              <li key={brand.id} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => onSelect(brand.slug)}
                  aria-pressed={active}
                  className={cn(
                    'relative flex w-full cursor-pointer items-center gap-2.5 px-4 text-left text-[13px] font-semibold transition-colors',
                    isAll ? 'py-4 text-sm' : 'py-2.5',
                    active
                      ? 'font-bold text-primary'
                      : 'text-foreground/70 hover:text-foreground',
                  )}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-0.5 bg-primary"
                    />
                  )}
                  {!isAll && brand.logo && (
                    <img
                      src={brand.logo}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="h-4 w-11 shrink-0 object-contain"
                    />
                  )}
                  {brand.name}
                </button>
              </li>
            )
          })}
        </ul>
      </aside>
    </div>
  )
}
