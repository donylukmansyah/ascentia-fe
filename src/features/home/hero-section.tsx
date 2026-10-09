import { useEffect, useState } from 'react'

import { CtaLink } from '#/components/ui/cta-link'
import { cn } from '#/lib/utils'

import { heroSlides } from './hero-data'

const AUTOPLAY_DELAY = 6500

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeSlide = heroSlides[activeIndex]

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (reducedMotion.matches) {
      return
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroSlides.length)
    }, AUTOPLAY_DELAY)

    return () => window.clearInterval(interval)
  }, [activeIndex])

  return (
    <section
      aria-label="Featured laboratory solutions"
      aria-roledescription="carousel"
      className="hero-carousel relative isolate flex min-h-svh items-stretch overflow-hidden bg-foreground text-white"
    >
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {heroSlides.map((slide, index) => (
          <img
            key={slide.id}
            src={slide.image}
            alt=""
            aria-hidden="true"
            fetchPriority={index === 0 ? 'high' : undefined}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            className={`hero-carousel__image pointer-events-none absolute inset-0 size-full select-none object-cover ${index === activeIndex ? 'is-active' : ''}`}
            style={{ objectPosition: slide.imagePosition }}
          />
        ))}
      </div>

      <div
        className="hero-carousel__overlay pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />
      <div
        className="hero-carousel__noise pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-7 pt-32 sm:px-8 sm:pb-9 sm:pt-36 lg:px-12 lg:pb-12 lg:pt-40">
        <div
          key={activeSlide.id}
          className="hero-carousel__copy mt-auto mb-[18vh] flex max-w-[min(100%,42rem)] flex-col items-start gap-5 sm:my-auto"
        >
          <p className="text-[10px] font-bold tracking-[0.12em] text-white/85 uppercase sm:text-[11px]">
            {activeSlide.eyebrow}
          </p>
          <h1 className="max-w-[42rem] text-[clamp(1.875rem,3.4vw,3.375rem)] leading-[1.03] font-bold tracking-[-0.045em] text-white">
            <span className="block">{activeSlide.titleLines[0]}</span>
            <span className="block">
              {activeSlide.titleLines[1]}{' '}
              <span className="text-accent">{activeSlide.highlight}</span>
            </span>
          </h1>
          <p className="max-w-[34rem] text-sm leading-relaxed font-normal text-white/85 sm:text-base">
            {activeSlide.description}
          </p>
          <CtaLink to={activeSlide.ctaTo} size="default" textTone="light">
            {activeSlide.ctaLabel}
          </CtaLink>
        </div>

        <div
          role="group"
          aria-label="Choose featured slide"
          className="sm:hidden"
        >
          <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white">
            <span
              className="size-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            {activeSlide.label}
          </p>
          <div className="mt-2 flex w-full items-center gap-2">
            {heroSlides.map((slide, index) => {
              const isActive = index === activeIndex

              return (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show ${slide.label}`}
                  aria-pressed={isActive}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'relative flex h-11 min-w-0 cursor-pointer items-center transition-[flex-basis] duration-500 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none',
                    isActive ? 'basis-[48%] shrink-0' : 'basis-0 flex-1',
                  )}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="invisible whitespace-nowrap text-[13px] font-medium"
                    >
                      {slide.label}
                    </span>
                  )}
                  <span className="hero-carousel__track absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 overflow-hidden rounded-full bg-white/35">
                    {isActive && (
                      <span
                        key={`${slide.id}-${activeIndex}`}
                        className="hero-carousel__progress block h-full rounded-full bg-primary"
                        style={{ animationDuration: `${AUTOPLAY_DELAY}ms` }}
                      />
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div
          role="group"
          aria-label="Choose featured slide"
          className="hidden grid-cols-4 gap-x-6 sm:grid"
        >
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show ${slide.label}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className="group/slide min-w-0 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <span
                className={`mb-2 block truncate text-xs font-medium transition-colors ${index === activeIndex ? 'text-white' : 'text-white/55 group-hover/slide:text-white/90'}`}
              >
                <span
                  className={`mr-1 font-semibold ${index === activeIndex ? 'text-primary' : 'text-white/55'}`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                {slide.label}
              </span>
              <span className="hero-carousel__track block h-[2px] overflow-hidden rounded-full bg-white/35">
                {index === activeIndex && (
                  <span
                    key={`${slide.id}-${activeIndex}`}
                    className="hero-carousel__progress block h-full rounded-full bg-primary"
                    style={{ animationDuration: `${AUTOPLAY_DELAY}ms` }}
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
