import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { CtaButton } from '#/components/ui/cta-link'
import { Reveal } from '#/components/ui/reveal'
import { cn } from '#/lib/utils'
import type {
  ProductDetailData,
  ProductDetailSection,
  ProductDetailTab,
} from '../types/product'
import { ProductImageGallery } from './product-image-gallery'
import { ProductQuoteDialog } from './product-quote-dialog'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.149-.198.297-.767.967-.94 1.164-.173.198-.347.223-.644.074-.297-.148-1.255-.463-2.39-1.477-.883-.787-1.478-1.76-1.65-2.057-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.496.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.298-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.148.198 2.095 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.414.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.868 9.868 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.375a9.868 9.868 0 0 1-1.509-5.26c.001-5.447 4.428-9.876 9.878-9.876a9.844 9.844 0 0 1 6.987 2.897 9.843 9.843 0 0 1 2.896 6.988c-.002 5.447-4.429 9.876-9.88 9.876m8.392-18.263A11.79 11.79 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892a11.84 11.84 0 0 0 1.582 5.96L0 24l6.335-1.662a11.868 11.868 0 0 0 5.709 1.454h.005c6.554 0 11.89-5.336 11.893-11.893a11.82 11.82 0 0 0-3.499-8.377Z" />
    </svg>
  )
}

function getProductWhatsAppUrl(name: string, brand: string): string {
  const pageUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : 'https://ascentia.co.id/products'
  const message = `Halo Tim Sales PT Ascentia Arsya Analitika, saya ingin konsultasi dan menanyakan penawaran harga untuk produk:\n\n*${name}* (${brand})\nLink: ${pageUrl}\n\nMohon informasinya, terima kasih.`
  return `https://wa.me/6285186061000?text=${encodeURIComponent(message)}`
}

interface ProductDetailContentProps {
  product: ProductDetailData
  tabs: ProductDetailSection[]
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

export function ProductDetailContent({
  product,
  tabs,
  activeTab,
  onTabChange,
}: ProductDetailContentProps) {
  const [quoteOpen, setQuoteOpen] = useState(false)
  const keyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next: number
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft')
      next = (index + tabs.length - 1) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return
    event.preventDefault()
    onTabChange(tabs[next].id)
    document.getElementById(`${tabs[next].id}-tab`)?.focus()
  }

  return (
    <section
      id="product"
      aria-label="Product details"
      className="scroll-mt-28 bg-background py-14 sm:py-18 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] lg:gap-16 lg:px-12">
        <aside className="min-w-0 lg:sticky lg:top-32 lg:self-start">
          <Reveal
            variant="up"
            distance={24}
            margin="0px 0px -40px 0px"
            className="w-full"
          >
            <ProductImageGallery
              images={product.images}
              productName={product.name}
            />
            <div className="mt-6 flex items-center gap-4">
              <div className="shrink-0">
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
              </div>
              <div className="flex min-w-0 flex-1 flex-wrap gap-2">
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
          </Reveal>
        </aside>
        <div className="min-w-0">
          <Reveal
            variant="up"
            distance={24}
            delay={0.08}
            margin="0px 0px -40px 0px"
            className="w-full"
          >
            <p className="text-[11px] font-bold tracking-[0.1em] text-primary uppercase">
              {product.brand}
            </p>
            <h2 className="mt-2 max-w-3xl text-[clamp(1.75rem,2.9vw,2.5rem)] leading-[1.1] font-bold tracking-[-0.03em] text-foreground break-words">
              {product.name}
            </h2>
            <div className="mt-5 flex items-center gap-2.5 sm:gap-3">
              <CtaButton onClick={() => setQuoteOpen(true)}>
                Get in touch
              </CtaButton>
              <a
                href={getProductWhatsAppUrl(product.name, product.brand)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Inquire via WhatsApp"
                title="Inquire via WhatsApp"
                className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-[10px] bg-[#25D366] text-white shadow-xs transition-all duration-200 hover:scale-105 hover:bg-[#20ba5a] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 motion-reduce:transition-none sm:size-11 sm:rounded-[12px]"
              >
                <WhatsAppIcon className="size-4.5 fill-white sm:size-6" />
              </a>
            </div>
            <ProductQuoteDialog
              product={product}
              open={quoteOpen}
              onOpenChange={setQuoteOpen}
            />
            <div
              id="description"
              role="tablist"
              aria-label="Product information"
              className="mt-7 flex scroll-mt-36 overflow-x-auto border border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  id={`${tab.id}-tab`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  onKeyDown={(event) => keyDown(event, index)}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'shrink-0 cursor-pointer border-r border-border px-4 py-3 text-[11px] font-bold text-foreground/65 transition-colors last:border-r-0 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary',
                    activeTab === tab.id &&
                      'bg-background text-foreground shadow-[inset_0_3px_0_0_var(--accent)]',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div
              id="description-panel"
              role="tabpanel"
              tabIndex={activeTab === 'description' ? 0 : undefined}
              aria-labelledby="description-tab"
              hidden={activeTab !== 'description'}
              className="border-x border-b border-border p-5 focus-visible:outline-2 focus-visible:outline-primary sm:p-7"
            >
              {product.summaryHtml && product.descriptionHtml ? (
                <>
                  <div
                    className="product-rich-text"
                    dangerouslySetInnerHTML={{ __html: product.summaryHtml }}
                  />
                  <details className="group mt-5">
                    <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 text-sm font-bold text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                      Read full description
                      <ChevronDown
                        className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </summary>
                    <div
                      className="product-rich-text mt-4"
                      dangerouslySetInnerHTML={{
                        __html: product.descriptionHtml,
                      }}
                    />
                  </details>
                </>
              ) : product.descriptionHtml ? (
                <ProductDescriptionToggle html={product.descriptionHtml} />
              ) : product.summaryHtml ? (
                <div
                  className="product-rich-text"
                  dangerouslySetInnerHTML={{ __html: product.summaryHtml }}
                />
              ) : (
                <p className="text-sm text-description-text">
                  Description not available.
                </p>
              )}
            </div>
            {tabs
              .filter((tab) => tab.id !== 'description')
              .map((tab) => (
                <div
                  key={tab.id}
                  id={tab.id}
                  hidden={activeTab !== tab.id}
                  className="scroll-mt-36"
                >
                  <div
                    id={`${tab.id}-panel`}
                    role="tabpanel"
                    tabIndex={activeTab === tab.id ? 0 : undefined}
                    aria-labelledby={`${tab.id}-tab`}
                    className="border-x border-b border-border p-5 focus-visible:outline-2 focus-visible:outline-primary sm:p-7"
                  >
                    <div
                      className="product-rich-text"
                      dangerouslySetInnerHTML={{
                        __html:
                          tab.id === 'specifications'
                            ? product.specificationsHtml
                            : product.applicationsHtml,
                      }}
                    />
                  </div>
                </div>
              ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
