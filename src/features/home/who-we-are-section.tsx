import { CtaLink } from '#/components/ui/cta-link'

import { CategoryNav } from './category-nav'

interface WhoWeAreSectionProps {
  image?: string
  heading?: string
  description?: string
  ctaLabel?: string
  ctaTo?: string
  showCategoryTicker?: boolean
}

const DEFAULT_IMAGE =
  '/images/contact-us/Collaborative Analysis in the Modern Lab 1.webp'
const DEFAULT_HEADING = 'Who We Are'
const DEFAULT_DESCRIPTION =
  'PT Ascentia Arsya Analitika delivers analytical instruments and laboratory equipment across Indonesia, combining trusted global brands, technical expertise, application training, and continuous support for research, education, mining, and industry.'

export function WhoWeAreSection({
  image = DEFAULT_IMAGE,
  heading = DEFAULT_HEADING,
  description = DEFAULT_DESCRIPTION,
  ctaLabel = 'Read More',
  ctaTo = '/about-us',
  showCategoryTicker = true,
}: WhoWeAreSectionProps) {
  return (
    <section
      aria-labelledby="who-we-are-heading"
      className="relative isolate w-full overflow-hidden bg-foreground text-white"
    >
      {/* Visual banner container with fixed/proportional height matching Figma */}
      <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden sm:min-h-[360px] lg:h-[380px]">
        {/* Background photo */}
        <div
          className="absolute inset-0 -z-20 overflow-hidden"
          aria-hidden="true"
        >
          <img
            src={image}
            alt=""
            loading="lazy"
            className="size-full object-cover object-center brightness-90"
          />
        </div>

        {/* Flat dark overlay (Figma: #252525 ~55-60% opacity) */}
        <div
          className="absolute inset-0 -z-10 bg-[#252525]/60"
          aria-hidden="true"
        />

        {/* Subtle noise texture */}
        <div
          className="hero-carousel__noise pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        />

        {/* Top area: Heading anchored at top-left */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-8 sm:px-8 sm:pt-10 lg:px-12 lg:pt-12">
          <div className="inline-flex items-center gap-3 sm:gap-4">
            <span
              className="h-[2px] w-6 shrink-0 bg-white/90 sm:w-8"
              aria-hidden="true"
            />
            <h2
              id="who-we-are-heading"
              className="text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl sm:normal-case lg:text-[2rem]"
            >
              {heading}
            </h2>
          </div>
        </div>

        {/* Bottom area: Description & CTA anchored to lower-right */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-8 sm:px-8 sm:pb-10 lg:px-12 lg:pb-12">
          <div className="ml-auto flex max-w-md flex-col items-start gap-4 sm:max-w-lg sm:gap-5 lg:max-w-[460px]">
            <p className="text-xs leading-relaxed font-light text-white/85 sm:text-[13px]">
              {description}
            </p>
            <CtaLink to={ctaTo} size="compact" textTone="light">
              {ctaLabel}
            </CtaLink>
          </div>
        </div>
      </div>

      {/* Integrated category ticker directly attached to the bottom */}
      {showCategoryTicker && <CategoryNav />}
    </section>
  )
}
