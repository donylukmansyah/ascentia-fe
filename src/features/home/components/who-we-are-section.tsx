import { useEffect, useRef } from 'react'

import { CtaLink } from '#/components/ui/cta-link'

import { CategoryNav } from './category-nav'

interface WhoWeAreSectionProps {
  image?: string
  eyebrow?: string
  heading?: string
  description?: string
  ctaLabel?: string
  ctaTo?: string
  showCategoryTicker?: boolean
}

const DEFAULT_IMAGE = '/images/homepage/assets-home.webp'
const DEFAULT_HEADING = 'Who We Are'
const DEFAULT_DESCRIPTION =
  'PT Ascentia Arsya Analitika delivers analytical instruments and laboratory equipment across Indonesia, combining trusted global brands, technical expertise, application training, and continuous support for research, education, mining, and industry.'

export function WhoWeAreSection({
  image = DEFAULT_IMAGE,
  eyebrow = 'About Us',
  heading = DEFAULT_HEADING,
  description = DEFAULT_DESCRIPTION,
  ctaLabel = 'Read More',
  ctaTo = '/about-us',
  showCategoryTicker = true,
}: WhoWeAreSectionProps) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const scene = sceneRef.current
    const imageElement = imageRef.current
    if (!scene || !imageElement) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let isNearViewport = false
    let animationFrame: number | null = null

    const updateScale = () => {
      animationFrame = null
      if (!isNearViewport) return
      if (reducedMotion.matches) {
        imageElement.style.setProperty('--who-we-are-scale', '1')
        return
      }

      const bounds = scene.getBoundingClientRect()
      const progress =
        (window.innerHeight - bounds.top) /
        (window.innerHeight + bounds.height * 0.55)
      const clampedProgress = Math.min(1, Math.max(0, progress))
      const easedProgress =
        clampedProgress * clampedProgress * (3 - 2 * clampedProgress)
      const scale = 1.32 - easedProgress * 0.32

      imageElement.style.setProperty('--who-we-are-scale', scale.toFixed(4))
    }

    const scheduleUpdate = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updateScale)
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isNearViewport = entry.isIntersecting
        if (isNearViewport) scheduleUpdate()
      },
      { rootMargin: '150px 0px' },
    )

    const handleScroll = () => {
      if (isNearViewport) scheduleUpdate()
    }

    observer.observe(scene)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    reducedMotion.addEventListener('change', scheduleUpdate)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', scheduleUpdate)
      reducedMotion.removeEventListener('change', scheduleUpdate)
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <section
      aria-labelledby="who-we-are-heading"
      className="relative isolate w-full overflow-hidden bg-foreground text-white"
    >
      <div
        ref={sceneRef}
        className="relative flex min-h-[460px] flex-col justify-between overflow-hidden sm:min-h-[520px] lg:min-h-[620px] lg:h-[630px] xl:h-[650px]"
      >
        <div
          className="absolute inset-0 -z-20 overflow-hidden"
          aria-hidden="true"
        >
          <img
            ref={imageRef}
            src={image}
            alt=""
            loading="lazy"
            className="who-we-are__image size-full object-cover object-[center_35%] brightness-95"
          />
        </div>

        <div
          className="absolute inset-0 -z-10 bg-[#202224]/60"
          aria-hidden="true"
        />
        <div
          className="hero-carousel__noise pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        />

        <div
          data-aos="fade-right"
          className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16 lg:px-14 lg:pt-20 xl:pt-24"
        >
          <p className="text-[10px] font-bold tracking-[0.12em] text-white/85 uppercase sm:text-[11px]">
            {eyebrow}
          </p>
          <h2
            id="who-we-are-heading"
            className="mt-2 text-[clamp(2rem,3.4vw,3rem)] leading-[1.04] font-bold tracking-[-0.045em] text-white"
          >
            {heading}
          </h2>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8 sm:pb-14 lg:px-14 lg:pb-18 xl:pb-20">
          <div
            data-aos="fade-up"
            data-aos-delay="150"
            className="ml-auto flex w-full max-w-sm flex-col items-start gap-3.5 sm:max-w-md sm:gap-4 lg:max-w-[550px] xl:max-w-[550px]"
          >
            <p className="text-sm leading-relaxed font-normal text-white/95 sm:text-base">
              {description}
            </p>
            <CtaLink to={ctaTo} size="default" textTone="light">
              {ctaLabel}
            </CtaLink>
          </div>
        </div>
      </div>

      {showCategoryTicker && <CategoryNav />}
    </section>
  )
}
