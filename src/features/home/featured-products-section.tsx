import { useCallback, useEffect, useRef, useState } from 'react'
import type { ComponentProps } from 'react'
import type { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { CtaLink } from '#/components/ui/cta-link'
import { ProductCard } from '#/features/products/product-card'
import { featuredProducts } from '#/features/products/products-data'
import type { ProductCardData } from '#/features/products/product-types'

interface FeaturedProductsSectionProps {
  kicker?: string
  title?: string
  description?: string
  products?: ProductCardData[]
  ctaLabel?: string
  ctaTo?: ComponentProps<typeof Link>['to']
}

export function FeaturedProductsSection({
  kicker = 'Products',
  title = 'Featured products',
  description = 'A focused selection of analytical instruments for sample preparation and reliable laboratory results.',
  products = featuredProducts,
  ctaLabel = 'View All Product',
  ctaTo = '/products',
}: FeaturedProductsSectionProps) {
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
    const gap = 24
    const step = card ? card.offsetWidth + gap : container.clientWidth

    container.scrollBy({
      left: direction === 'prev' ? -step : step,
      behavior: 'smooth',
    })
  }

  return (
    <section
      aria-labelledby="featured-products-heading"
      className="bg-background py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold tracking-[0.12em] text-primary uppercase sm:text-[11px]">
              {kicker}
            </p>
            <h2
              id="featured-products-heading"
              className="mt-2 text-[clamp(2rem,3.4vw,3rem)] leading-[1.04] font-bold tracking-[-0.045em] text-foreground"
            >
              {title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed font-normal text-description-text sm:text-base">
              {description}
            </p>
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
          tabIndex={0}
          role="region"
          aria-label="Featured products catalog"
          className="mt-10 flex gap-4 overflow-x-auto pb-4 pt-2 scroll-smooth scrollbar-none snap-x snap-mandatory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:mt-12 sm:gap-6"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-0 shrink-0 snap-start basis-[88%] sm:basis-[calc(50%-12px)] lg:basis-[calc(33.333333%-16px)]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center sm:mt-8">
          <CtaLink to={ctaTo} size="default" textTone="light">
            {ctaLabel}
          </CtaLink>
        </div>
      </div>
    </section>
  )
}
