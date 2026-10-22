import { ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { cn } from 'cn'

import { Breadcrumb } from '#/components/ui/breadcrumb'
import { useLanguage } from '#/lib/i18n'

import { brandsHeroContent } from '../constants/brands-hero'

interface ProductsHeroSectionProps {
  title?: string
  exploreLabel?: string
  breadcrumbCurrent?: string
  image?: string
  imagePosition?: string
  imagePositionClassName?: string
  parallaxRange?: number
}

export function ProductsHeroSection({
  title = brandsHeroContent.title,
  exploreLabel = 'Explore products by brand',
  breadcrumbCurrent = brandsHeroContent.breadcrumbCurrent,
  image = brandsHeroContent.image,
  imagePosition = 'center 20%',
  imagePositionClassName,
  parallaxRange = 80,
}: ProductsHeroSectionProps = {}) {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    [-parallaxRange, parallaxRange],
  )

  return (
    <section
      ref={sectionRef}
      aria-labelledby="products-hero-heading"
      className="relative isolate flex min-h-[340px] w-full items-end overflow-hidden bg-foreground text-white sm:min-h-[400px] lg:min-h-[440px]"
    >
      <motion.img
        src={image}
        alt=""
        fetchPriority="high"
        decoding="async"
        style={{
          objectPosition: imagePositionClassName ? undefined : imagePosition,
          y: reduceMotion ? 0 : imageY,
        }}
        className={cn(
          'absolute inset-x-0 -top-24 -z-20 h-[calc(100%+12rem)] w-full object-cover',
          imagePositionClassName,
        )}
      />
      <div
        className="hero-carousel__overlay pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />
      <div
        className="hero-carousel__noise pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pt-24 pb-16 sm:px-8 sm:pt-28 sm:pb-16 lg:px-12 lg:pt-32">
        <div className="hero-carousel__copy flex max-w-[min(100%,42rem)] flex-col items-start gap-5 text-left">
          <Breadcrumb
            items={[
              { label: t('nav.home'), to: '/' },
              { label: breadcrumbCurrent },
            ]}
          />
          <div className="flex items-center gap-3 sm:gap-4">
            <h1
              id="products-hero-heading"
              className="text-[clamp(1.875rem,3.4vw,3.375rem)] leading-[1.03] font-bold tracking-[-0.04em] text-white"
            >
              {title}
            </h1>
            <a
              href="#product-results"
              aria-label={exploreLabel}
              className="group/products-hero relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center justify-end rounded-full bg-accent pr-1 transition-[background-color,translate] duration-200 hover:-translate-y-0.5 hover:bg-[var(--brand-dark)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none sm:h-10 sm:w-[4.5rem]"
            >
              <span className="grid size-7 place-items-center rounded-full bg-white text-foreground transition-transform duration-300 ease-out group-hover/products-hero:-translate-x-[calc(100%+0.25rem)] group-focus-visible/products-hero:-translate-x-[calc(100%+0.25rem)] motion-reduce:transition-none sm:size-8">
                <ArrowUpRight
                  className="size-4 transition-transform duration-200 group-hover/products-hero:rotate-45 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
