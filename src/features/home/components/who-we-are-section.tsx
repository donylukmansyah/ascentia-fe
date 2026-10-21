import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

import { CtaLink } from '#/components/ui/cta-link'
import { Reveal } from '#/components/ui/reveal'
import { useLanguage } from '#/lib/i18n'

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
  'PT Ascentia Arsya Analitika is the specialized analytical instrumentation division of PT Dynatech International Group. Backed by two decades of engineering heritage and strategic hubs in Jakarta and Kendari, we partner with world leaders including XRF Scientific and OREAS to deliver reliable sample preparation, certified reference materials, and dedicated on-site engineering support across Indonesia.'

export function WhoWeAreSection({
  image = DEFAULT_IMAGE,
  eyebrow,
  heading,
  description,
  ctaLabel,
  ctaTo = '/about-us',
  showCategoryTicker = true,
}: WhoWeAreSectionProps) {
  const { t } = useLanguage()
  const resolvedEyebrow = eyebrow ?? t('home.whoWeAre.eyebrow', 'About Us')
  const resolvedHeading = heading ?? t('home.whoWeAre.heading', DEFAULT_HEADING)
  const resolvedDesc =
    description ?? t('home.whoWeAre.description', DEFAULT_DESCRIPTION)
  const resolvedCta = ctaLabel ?? t('home.whoWeAre.cta', 'About Ascentia')

  const sceneRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start end', 'end start'],
  })
  // Zoom-out tied to scroll position like before.
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.32, 1])

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
          <motion.img
            src={image}
            width={1034}
            height={582}
            alt=""
            loading="lazy"
            style={{ scale: reduceMotion ? 1 : imageScale }}
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

        <Reveal
          variant="right"
          className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16 lg:px-14 lg:pt-20 xl:pt-24"
        >
          <p className="text-[10px] font-bold tracking-[0.12em] text-white/85 uppercase sm:text-[11px]">
            {resolvedEyebrow}
          </p>
          <h2
            id="who-we-are-heading"
            className="mt-2 text-[clamp(1.75rem,2.9vw,2.5rem)] leading-[1.04] font-bold tracking-[-0.045em] text-white"
          >
            {resolvedHeading}
          </h2>
        </Reveal>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8 sm:pb-14 lg:px-14 lg:pb-18 xl:pb-20">
          <Reveal
            variant="up"
            delay={0.15}
            className="ml-auto flex w-full max-w-sm flex-col items-start gap-3.5 sm:max-w-md sm:gap-4 lg:max-w-[550px] xl:max-w-[550px]"
          >
            <p className="text-sm leading-relaxed font-normal text-white/95 sm:text-base">
              {resolvedDesc}
            </p>
            <CtaLink to={ctaTo} size="default">
              {resolvedCta}
            </CtaLink>
          </Reveal>
        </div>
      </div>

      {showCategoryTicker && <CategoryNav />}
    </section>
  )
}
