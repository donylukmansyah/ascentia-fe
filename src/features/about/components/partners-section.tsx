import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { Button } from '#/components/ui/button'

import { aboutPartnersContent } from '../constants/partners'
import { AboutPartnerCard } from './partner-card'

interface AboutPartnersSectionProps {
  eyebrow?: string
  title?: string
  description?: string
}

export function AboutPartnersSection({
  eyebrow = aboutPartnersContent.eyebrow,
  title = aboutPartnersContent.title,
  description = aboutPartnersContent.description,
}: AboutPartnersSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)
  const partners = aboutPartnersContent.partners
  const activePartner = partners[activeIndex]

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
    const observer = new ResizeObserver(() => checkScroll())
    observer.observe(container)
    return () => observer.disconnect()
  }, [checkScroll])

  const scrollToCard = useCallback((index: number) => {
    const container = scrollContainerRef.current
    const card = container?.children[index] as HTMLElement | undefined
    card?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    })
  }, [])

  const selectPartner = (index: number) => {
    setActiveIndex(index)
    scrollToCard(index)
  }

  const goTo = (direction: 'prev' | 'next') => {
    const nextIndex =
      direction === 'prev'
        ? (activeIndex - 1 + partners.length) % partners.length
        : (activeIndex + 1) % partners.length
    setActiveIndex(nextIndex)
    scrollToCard(nextIndex)
  }

  return (
    <section aria-labelledby="about-partners-heading" className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-5 pt-16 sm:px-8 sm:pt-20 lg:px-12 lg:pt-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold tracking-[0.12em] text-primary uppercase sm:text-[11px]">
              {eyebrow}
            </p>
            <h2
              id="about-partners-heading"
              className="mt-2 text-[clamp(2rem,3.4vw,3rem)] leading-[1.04] font-bold tracking-[-0.045em] text-foreground"
            >
              {title}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed font-normal text-description-text sm:text-base lg:pb-2 lg:text-right">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-10 bg-[#F7F9FC] py-10 lg:py-14">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 sm:px-8 lg:grid-cols-2 lg:gap-0 lg:px-12">
          <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/10] lg:aspect-[4/3]">
            <img
              key={activePartner.id}
              src={activePartner.image}
              alt={activePartner.imageAlt}
              loading="lazy"
              decoding="async"
              className="size-full object-cover object-center"
            />
          </div>

          <div className="min-w-0 lg:-ml-40 lg:pl-0">
            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              tabIndex={0}
              role="region"
              aria-label="Partner brands catalog"
              className="flex gap-5 overflow-x-auto scroll-smooth px-1 pt-2 pb-4 scrollbar-none snap-x snap-mandatory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:pr-1"
            >
              {partners.map((partner, index) => (
                <div
                  key={partner.id}
                  className="w-[280px] shrink-0 snap-start sm:w-[320px]"
                >
                  <AboutPartnerCard
                    partner={partner}
                    active={index === activeIndex}
                    onSelect={() => selectPartner(index)}
                    className="h-full"
                  />
                </div>
              ))}
            </div>

            <div
              className="mt-6 flex items-center justify-end gap-3 lg:pr-1"
              role="group"
              aria-label="Partner carousel controls"
            >
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Previous partners"
                disabled={!canScrollPrev && activeIndex === 0}
                onClick={() => goTo('prev')}
                className="size-11 cursor-pointer rounded-full border border-border bg-white text-[var(--brand-dark)] transition-all hover:border-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowLeft className="size-5" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="default"
                size="icon"
                aria-label="Next partners"
                disabled={!canScrollNext && activeIndex === partners.length - 1}
                onClick={() => goTo('next')}
                className="size-11 cursor-pointer rounded-full border border-primary bg-primary text-white shadow-xs transition-all hover:border-[var(--brand-dark)] hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowRight className="size-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
