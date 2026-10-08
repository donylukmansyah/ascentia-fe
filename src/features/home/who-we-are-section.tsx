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
      {/* Spacious banner container with balanced height */}
      <div className="relative flex min-h-[480px] flex-col justify-between overflow-hidden sm:min-h-[520px] lg:h-[540px]">
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

        {/* Flat dark overlay */}
        <div
          className="absolute inset-0 -z-10 bg-[#202224]/60"
          aria-hidden="true"
        />

        {/* Subtle noise texture */}
        <div
          className="hero-carousel__noise pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        />

        {/* Top: "— Who We Are" upper-left */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-12 sm:px-10 sm:pt-16 lg:px-14 lg:pt-20">
          <h2
            id="who-we-are-heading"
            className="inline-flex items-center text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.65rem]"
          >
            <span className="mr-3 font-light text-white/80" aria-hidden="true">
              —
            </span>
            <span>{heading}</span>
          </h2>
        </div>

        {/* Bottom: Wider paragraph block & CTA button lower-right */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-10 sm:px-10 sm:pb-14 lg:px-14 lg:pb-16">
          <div className="ml-auto flex w-full max-w-lg flex-col items-start gap-4 sm:max-w-xl sm:gap-5 lg:max-w-[540px]">
            <p className="text-sm leading-relaxed font-light text-white/95 sm:text-base lg:text-[15px]">
              {description}
            </p>
            <CtaLink to={ctaTo} size="compact" textTone="light">
              {ctaLabel}
            </CtaLink>
          </div>
        </div>
      </div>

      {/* Integrated category ticker banner at the bottom */}
      {showCategoryTicker && <CategoryNav />}
    </section>
  )
}
