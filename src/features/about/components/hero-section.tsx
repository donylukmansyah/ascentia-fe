import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { aboutHeroContent } from '../constants/hero'

interface AboutHeroSectionProps {
  imagePosition?: string
  parallaxRange?: number
}

export function AboutHeroSection({
  imagePosition = 'center 20%',
  parallaxRange = 80,
}: AboutHeroSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const image = imageRef.current
    if (!section || !image) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame: number | null = null
    let visible = false

    const update = () => {
      frame = null
      if (!visible) return
      const rect = section.getBoundingClientRect()
      const progress = Math.min(
        1,
        Math.max(0, -rect.top / Math.max(1, rect.height)),
      )
      const eased = progress * progress * (3 - 2 * progress)
      image.style.translate = `0 ${(-parallaxRange + eased * parallaxRange * 2).toFixed(2)}px`
    }

    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(update)
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) schedule()
      },
      { rootMargin: '120px 0px' },
    )
    const onScroll = () => {
      if (visible) schedule()
    }

    observer.observe(section)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', schedule)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [parallaxRange])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="about-hero-heading"
      className="relative isolate flex min-h-[440px] w-full items-center overflow-hidden bg-foreground text-white sm:min-h-[500px] lg:min-h-[560px]"
    >
      <img
        ref={imageRef}
        src={aboutHeroContent.image}
        alt=""
        fetchPriority="high"
        decoding="async"
        style={{ objectPosition: imagePosition }}
        className="absolute inset-x-0 -top-24 -z-20 h-[calc(100%+12rem)] w-full object-cover"
      />
      <div
        className="hero-carousel__overlay pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />
      <div
        className="hero-carousel__noise pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-24 pt-32 sm:px-8 sm:pb-28 sm:pt-36 lg:px-12 lg:pb-32 lg:pt-40">
        <div className="hero-carousel__copy flex max-w-[min(100%,42rem)] flex-col items-start gap-5 text-left">
          <p className="text-[10px] font-bold tracking-[0.12em] text-white/85 uppercase sm:text-[11px]">
            {aboutHeroContent.eyebrow}
          </p>
          <div className="flex items-center gap-3 sm:gap-4">
            <h1
              id="about-hero-heading"
              className="text-[clamp(1.875rem,3.4vw,3.375rem)] leading-[1.03] font-bold tracking-[-0.045em] text-white"
            >
              {aboutHeroContent.title}
            </h1>
            <a
              href="#about-content"
              aria-label="Explore About Us content"
              className="group/about-hero relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center justify-end rounded-full bg-accent pr-1 transition-[background-color,translate] duration-200 hover:-translate-y-0.5 hover:bg-[var(--brand-dark)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none sm:h-10 sm:w-[4.5rem]"
            >
              <span className="grid size-7 place-items-center rounded-full bg-white text-foreground transition-transform duration-300 ease-out group-hover/about-hero:-translate-x-[calc(100%+0.25rem)] group-focus-visible/about-hero:-translate-x-[calc(100%+0.25rem)] motion-reduce:transition-none sm:size-8">
                <ArrowUpRight
                  className="size-4 transition-transform duration-200 group-hover/about-hero:rotate-45 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </span>
            </a>
          </div>
          <p className="max-w-[34rem] text-sm leading-relaxed font-normal text-white/85 sm:text-base">
            {aboutHeroContent.description}
          </p>
        </div>
      </div>
    </section>
  )
}
