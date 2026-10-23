import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { ComponentProps } from 'react'
import type { Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { CtaLink } from '#/components/ui/cta-link'
import { Reveal } from '#/components/ui/reveal'
import { useLanguage } from '#/lib/i18n'
import type { ProductCardData } from '#/features/products/types/product'

import { ProductCard } from './product-card'

interface ProductCarouselSectionProps {
  kicker?: string
  title?: string
  description?: string
  products: ProductCardData[]
  pending?: boolean
  error?: boolean
  retry?: () => void
  ctaTo?: ComponentProps<typeof Link>['to']
  ctaLabel?: string
}

export function ProductCarouselSection({
  kicker,
  title,
  description,
  products,
  pending = false,
  error = false,
  retry,
  ctaTo,
  ctaLabel,
}: ProductCarouselSectionProps) {
  const { t } = useLanguage()
  const headingId = useId()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const checkScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) {
      setCanScrollPrev(false)
      setCanScrollNext(false)
      return
    }
    const tolerance = 4
    setCanScrollPrev(container.scrollLeft > tolerance)
    setCanScrollNext(
      container.scrollLeft + container.clientWidth <
        container.scrollWidth - tolerance,
    )
  }, [])

  useEffect(() => {
    const container = scrollContainerRef.current
    checkScroll()
    if (!container) return

    const observer = new ResizeObserver(checkScroll)
    observer.observe(container)
    for (const card of container.children) observer.observe(card)

    return () => {
      observer.disconnect()
    }
  }, [checkScroll, products, pending, error])

  const scrollByCard = (direction: 'prev' | 'next') => {
    const container = scrollContainerRef.current
    if (!container) return

    const card = container.firstElementChild as HTMLElement | null
    const gap = 16
    const step = card ? card.offsetWidth + gap : container.clientWidth

    container.scrollBy({
      left: direction === 'prev' ? -step : step,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }

  if (!pending && !error && !products.length) return null

  return (
    <section
      aria-labelledby={headingId}
      className="overflow-x-clip bg-background py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal
          variant="up"
          distance={28}
          duration={0.5}
          margin="0px 0px -60px 0px"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {kicker && <p className="section-kicker mb-2">{kicker}</p>}
              <h2 id={headingId} className="section-title">
                {title ?? t('ui.recommendations')}
              </h2>
              {description && (
                <p className="section-description mt-4 max-w-2xl">
                  {description}
                </p>
              )}
            </div>

            {!pending &&
              !error &&
              products.length > 0 &&
              (canScrollPrev || canScrollNext) && (
                <div
                  className="flex items-center gap-3 shrink-0"
                  role="group"
                  aria-label={t('ui.productControls')}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={t('ui.previousProducts')}
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
                    aria-label={t('ui.nextProducts')}
                    disabled={!canScrollNext}
                    onClick={() => scrollByCard('next')}
                    className="size-11 cursor-pointer rounded-full border border-primary bg-primary text-white shadow-xs transition-all hover:border-[var(--brand-dark)] hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ArrowRight className="size-5" aria-hidden="true" />
                  </Button>
                </div>
              )}
          </div>
        </Reveal>

        {pending ? (
          <div
            aria-busy="true"
            role="status"
            className="mt-10 flex gap-4 overflow-hidden pt-2 pb-4"
          >
            <span className="sr-only">{t('ui.loadingProducts')}</span>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                aria-hidden="true"
                className="h-80 min-w-0 shrink-0 animate-pulse rounded-xl bg-muted basis-[88%] sm:basis-[calc(50%-12px)] lg:basis-[calc((100%-104px)/3)] motion-reduce:animate-none"
              />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="mt-10 flex items-center gap-3">
            <p className="text-sm text-description-text">
              {t('ui.productsError')}
            </p>
            {retry && (
              <Button
                type="button"
                variant="outline"
                onClick={retry}
                className="cursor-pointer"
              >
                {t('common.tryAgain')}
              </Button>
            )}
          </div>
        ) : (
          <Reveal
            variant="up"
            distance={32}
            delay={0.12}
            duration={0.55}
            margin="0px 0px -60px 0px"
          >
            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              onLoadCapture={checkScroll}
              role="region"
              aria-roledescription="carousel"
              aria-label={t('home.featured.title')}
              className="mt-10 flex gap-4 overflow-hidden pt-2 pb-4 scroll-smooth motion-reduce:scroll-auto snap-x snap-mandatory [touch-action:pan-y]"
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="min-w-0 shrink-0 snap-start basis-[88%] sm:basis-[calc(50%-12px)] lg:basis-[calc((100%-104px)/3)]"
                >
                  <ProductCard product={product} className="h-full" />
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {ctaTo && !error && (
          <div className="mt-10 flex justify-center sm:mt-12">
            <Reveal
              variant="up"
              distance={24}
              delay={0.22}
              duration={0.5}
              margin="0px 0px -50px 0px"
            >
              <CtaLink to={ctaTo} size="default">
                {ctaLabel ?? t('ui.viewAllProducts')}
              </CtaLink>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  )
}
