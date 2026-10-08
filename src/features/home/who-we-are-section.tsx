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
      {/* Banner container with balanced height and natural spacing */}
      <div className="relative flex min-h-[380px] flex-col justify-between overflow-hidden sm:min-h-[420px] lg:h-[470px] xl:h-[490px]">
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
          className="absolute inset-0 -z-10 bg-[#202224]/60"
          aria-hidden="true"
        />

        {/* Subtle noise texture */}
        <div
          className="hero-carousel__noise pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        />

        {/* Top: "— Who We Are" upper-left */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-8 sm:px-8 sm:pt-11 lg:px-14 lg:pt-14">
          <h2
            id="who-we-are-heading"
            className="inline-flex items-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2.65rem]"
          >
            <span className="mr-3 font-light text-white/80" aria-hidden="true">
              —
            </span>
            <span>{heading}</span>
          </h2>
        </div>

        {/* Bottom: Paragraph & CTA aligned lower-right */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-7 sm:px-8 sm:pb-9 lg:px-14 lg:pb-12">
          <div className="ml-auto flex w-full max-w-md flex-col items-start gap-3.5 sm:max-w-lg sm:gap-4 lg:max-w-[480px]">
            <p className="text-xs leading-relaxed font-light text-white/95 sm:text-sm lg:text-[14px]">
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
