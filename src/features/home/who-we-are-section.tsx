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

const DEFAULT_IMAGE = '/images/homepage/assets-home.webp'
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
      {/* Banner matching Figma dimensions (~380-420px height) */}
      <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden sm:min-h-[380px] lg:h-[400px]">
        {/* Background photo: assets-home.webp */}
        <div
          className="absolute inset-0 -z-20 overflow-hidden"
          aria-hidden="true"
        >
          <img
            src={image}
            alt=""
            loading="lazy"
            className="size-full object-cover object-[center_35%] brightness-95"
          />
        </div>

        {/* Flat dark overlay (#252525 ~55% opacity) */}
        <div
          className="absolute inset-0 -z-10 bg-[#252525]/55"
          aria-hidden="true"
        />

        {/* Reusable noise texture */}
        <div
          className="hero-carousel__noise pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        />

        {/* Top: "— Who We Are" positioned upper-left */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-10 sm:px-10 sm:pt-12 lg:px-14 lg:pt-14">
          <h2
            id="who-we-are-heading"
            className="inline-flex items-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2.15rem]"
          >
            <span
              className="mr-2.5 font-light text-white/90"
              aria-hidden="true"
            >
              —
            </span>
            <span>{heading}</span>
          </h2>
        </div>

        {/* Bottom: Paragraph & CTA aligned right-center */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-8 sm:px-10 sm:pb-10 lg:px-14 lg:pb-12">
          <div className="ml-auto flex w-full max-w-[320px] flex-col items-start gap-3.5 sm:max-w-[360px] sm:gap-4 lg:max-w-[380px]">
            <p className="text-[11px] leading-relaxed font-normal text-white/90 sm:text-xs">
              {description}
            </p>
            <CtaLink to={ctaTo} size="compact" textTone="light">
              {ctaLabel}
            </CtaLink>
          </div>
        </div>
      </div>

      {/* Category ticker attached to the bottom */}
      {showCategoryTicker && <CategoryNav />}
    </section>
  )
}
