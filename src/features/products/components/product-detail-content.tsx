import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '#/lib/utils'
import type { ProductDetailData } from '../types/product'
import type { ProductDetailTab } from './product-detail-nav'

interface ProductDetailContentProps {
  product: ProductDetailData
  activeTab: ProductDetailTab
  onTabChange: (tab: ProductDetailTab) => void
}

const previewClamps = {
  8: 'line-clamp-8',
  12: 'line-clamp-12',
  16: 'line-clamp-16',
} as const

function ProductDescriptionToggle({
  html,
  previewLines = 16,
}: {
  html: string
  previewLines?: keyof typeof previewClamps
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <div
        className={cn(
          'product-rich-text',
          !expanded && previewClamps[previewLines],
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        className="mt-5 flex min-h-11 w-fit cursor-pointer items-center gap-2 text-sm font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        {expanded ? 'Show less' : 'Read full description'}
        <ChevronDown
          className={cn(
            'size-4 transition-transform motion-reduce:transition-none',
            expanded && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
    </>
  )
}

export function ProductDetailContent({ product, activeTab, onTabChange }: ProductDetailContentProps) {
  const tabs: Array<{ id: ProductDetailTab; label: string }> = [
    { id: 'description', label: 'Description' },
    ...(product.specificationsHtml ? [{ id: 'specifications' as const, label: 'Specifications' }] : []),
  ]
  const keyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return
    event.preventDefault()
    onTabChange(tabs[next].id)
    document.getElementById(`${tabs[next].id}-tab`)?.focus()
  }

  return (
    <section id="product" aria-label="Product details" className="scroll-mt-28 bg-background py-14 sm:py-18 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] lg:gap-16 lg:px-12">
        <aside className="min-w-0 lg:sticky lg:top-32 lg:self-start">
          <div className="flex aspect-square items-center justify-center bg-[color-mix(in_srgb,var(--primary)_10%,white)] p-8 sm:p-12">
            {product.image && <img src={product.image} srcSet={product.imageSrcSet} sizes="(min-width: 1024px) 480px, 90vw" alt={product.imageAlt || product.name} width={600} height={600} loading="eager" decoding="async" draggable={false} className="h-[84%] w-[84%] object-contain" />}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="shrink-0">{product.brandLogo ? <img src={product.brandLogo} alt={product.brand} loading="lazy" decoding="async" className="h-10 w-auto object-contain object-left" /> : <p className="text-sm font-bold tracking-[-0.025em] text-primary">{product.brand}</p>}</div>
            <div className="flex min-w-0 flex-1 flex-wrap gap-2">{product.tags.map((tag) => <span key={tag} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold text-primary">{tag}</span>)}</div>
          </div>
        </aside>
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.1em] text-primary uppercase">{product.brand}</p>
          <h2 className="mt-2 max-w-3xl text-[clamp(1.75rem,2.9vw,2.5rem)] leading-[1.1] font-bold tracking-[-0.03em] text-foreground break-words">{product.name}</h2>
          <div id="description" role="tablist" aria-label="Product information" className="mt-7 flex scroll-mt-36 border border-border">
            {tabs.map((tab, index) => <button key={tab.id} id={`${tab.id}-tab`} type="button" role="tab" aria-selected={activeTab === tab.id} aria-controls={`${tab.id}-panel`} tabIndex={activeTab === tab.id ? 0 : -1} onKeyDown={(event) => keyDown(event, index)} onClick={() => onTabChange(tab.id)} className={cn('cursor-pointer border-r border-border px-4 py-3 text-[11px] font-bold text-foreground/65 transition-colors last:border-r-0 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary', activeTab === tab.id && 'bg-background text-foreground shadow-[inset_0_3px_0_0_var(--accent)]')}>{tab.label}</button>)}
          </div>
          <div id="description-panel" role="tabpanel" tabIndex={activeTab === 'description' ? 0 : undefined} aria-labelledby="description-tab" hidden={activeTab !== 'description'} className="border-x border-b border-border p-5 focus-visible:outline-2 focus-visible:outline-primary sm:p-7">
            {product.summaryHtml && product.descriptionHtml ? <>
              <div className="product-rich-text" dangerouslySetInnerHTML={{ __html: product.summaryHtml }} />
              <details className="group mt-5">
                <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 text-sm font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">Read full description<ChevronDown className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" /></summary>
                <div className="product-rich-text mt-4" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
              </details>
            </> : product.descriptionHtml ? (
              <ProductDescriptionToggle html={product.descriptionHtml} />
            ) : product.summaryHtml ? <div className="product-rich-text" dangerouslySetInnerHTML={{ __html: product.summaryHtml }} /> : <p className="text-sm text-description-text">Description not available.</p>}
          </div>
          {product.specificationsHtml && <div id="specifications" className="scroll-mt-36"><div id="specifications-panel" role="tabpanel" tabIndex={activeTab === 'specifications' ? 0 : undefined} aria-labelledby="specifications-tab" hidden={activeTab !== 'specifications'} className="border-x border-b border-border p-5 focus-visible:outline-2 focus-visible:outline-primary sm:p-7"><div className="product-rich-text" dangerouslySetInnerHTML={{ __html: product.specificationsHtml }} /></div></div>}
        </div>
      </div>
    </section>
  )
}
