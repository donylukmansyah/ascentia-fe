import { Check } from 'lucide-react'

import { cn } from '#/lib/utils'
import type { ProductDetailData } from '../types/product'
import type { ProductDetailTab } from './product-detail-nav'

interface ProductDetailContentProps {
  product: ProductDetailData
  activeTab: ProductDetailTab
  onTabChange: (tab: ProductDetailTab) => void
}

const tabs: Array<{ id: ProductDetailTab; label: string }> = [
  { id: 'description', label: 'Descriptions' },
  { id: 'specifications', label: 'Specifications' },
]

export function ProductDetailContent({
  product,
  activeTab,
  onTabChange,
}: ProductDetailContentProps) {
  return (
    <section
      id="product"
      aria-label="Product details"
      className="scroll-mt-16 bg-background py-14 sm:py-18 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] lg:gap-16 lg:px-12">
        <aside className="min-w-0">
          <div className="flex aspect-square items-center justify-center bg-[color-mix(in_srgb,var(--primary)_10%,white)] p-8 sm:p-12">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                loading="eager"
                decoding="async"
                draggable={false}
                className="h-[84%] w-[84%] object-contain"
              />
            ) : null}
          </div>
          <div className="mt-6">
            {product.brandLogo ? (
              <img
                src={product.brandLogo}
                alt={product.brand}
                loading="lazy"
                decoding="async"
                className="h-10 w-auto object-contain object-left"
              />
            ) : (
              <p className="text-sm font-bold tracking-[-0.025em] text-primary">
                {product.brand}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.1em] text-primary uppercase">
            {product.brand}
          </p>
          <h2 className="mt-2 max-w-3xl line-clamp-2 text-[clamp(1.75rem,2.9vw,2.5rem)] leading-[1.04] font-bold tracking-[-0.045em] text-foreground break-words">
            {product.name}
          </h2>

          <div
            id="description"
            role="tablist"
            aria-label="Product information"
            className="mt-7 flex scroll-mt-16 border border-border"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  id={`${tab.id}-tab`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${tab.id}-panel`}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'cursor-pointer border-r border-border px-4 py-3 text-[11px] font-bold text-foreground/65 transition-colors last:border-r-0 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary',
                    isActive &&
                      'bg-background text-foreground shadow-[inset_0_3px_0_0_var(--accent)]',
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div
            id="description-panel"
            role="tabpanel"
            aria-labelledby="description-tab"
            hidden={activeTab !== 'description'}
            className="border-x border-b border-border p-5 sm:p-7"
          >
            <h3 className="text-base font-bold tracking-[-0.03em] text-foreground break-words">
              {product.name}
            </h3>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-description-text">
              {product.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {product.benefits.length > 0 ? (
              <div className="mt-8">
                <h4 className="text-sm font-bold text-foreground">
                  Key benefits
                </h4>
                <ul className="mt-4 space-y-4">
                  {product.benefits.map((benefit) => (
                    <li key={benefit.title} className="flex gap-3">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {benefit.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-description-text">
                          {benefit.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div
            id="specifications"
            role="tabpanel"
            aria-labelledby="specifications-tab"
            hidden={activeTab !== 'specifications'}
            className="scroll-mt-16 border-x border-b border-border p-5 sm:p-7"
          >
            <h3 className="text-base font-bold tracking-[-0.03em] text-foreground">
              Specifications
            </h3>
            <dl className="mt-5 divide-y divide-border border-y border-border">
              {product.specifications.map((specification) => (
                <div
                  key={specification.label}
                  className="grid gap-1 py-3 sm:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] sm:gap-5"
                >
                  <dt className="text-sm font-bold text-foreground">
                    {specification.label}
                  </dt>
                  <dd className="text-sm leading-relaxed text-description-text">
                    {specification.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
