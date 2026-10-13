import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { featuredProducts } from '#/features/products/constants/products'
import type { ProductCardData } from '#/features/products/types/product'

import { ProductCard } from './product-card'

interface ProductCarouselSectionProps {
  title?: string
  products?: ProductCardData[]
}

export function ProductCarouselSection({
  title = 'Explore our recommendations',
  products = featuredProducts,
}: ProductCarouselSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const checkScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const tolerance = 4
    setCanScrollPrev(container.scrollLeft > tolerance)
    setCanScrollNext(
      container.scrollLeft + container.clientWidth <
        container.scrollWidth - tolerance,
    )
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    checkScroll()

    const observer = new ResizeObserver(() => {
      checkScroll()
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [checkScroll])

  const scrollByCard = (direction: 'prev' | 'next') => {
    const container = scrollContainerRef.current
    if (!container) return

    const card = container.firstElementChild as HTMLElement | null
    const gap = 16
    const step = card ? card.offsetWidth + gap : container.clientWidth

    container.scrollBy({
      left: direction === 'prev' ? -step : step,
      behavior: 'smooth',
    })
  }

  return (
    <section
      aria-labelledby="featured-products-heading"
      className="overflow-x-clip bg-background py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="featured-products-heading"
              className="text-[clamp(1.75rem,2.9vw,2.5rem)] leading-[1.04] font-bold tracking-[-0.04em] text-foreground"
            >
              {title}
            </h2>
          </div>

          <div
            className="flex items-center gap-3 shrink-0"
            role="group"
            aria-label="Product carousel controls"
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous products"
              disabled={!canScrollPrev}
              onClick={() => scrollByCard('prev')}
              className="size-11 cursor-pointer rounded-full border border-border bg-white text-[var(--brand-dark)] transition-all hover:border-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="default"
              size="icon"
              aria-label="Next products"
              disabled={!canScrollNext}
              onClick={() => scrollByCard('next')}
              className="size-11 cursor-pointer rounded-full border border-primary bg-primary text-white shadow-xs transition-all hover:border-[var(--brand-dark)] hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowRight className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured products catalog"
          className="mt-10 flex gap-4 overflow-hidden pt-2 pb-4 scroll-smooth snap-x snap-mandatory [touch-action:pan-y]"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-0 shrink-0 snap-start basis-[88%] sm:basis-[calc(50%-12px)] lg:basis-[calc((100%-104px)/3)]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
