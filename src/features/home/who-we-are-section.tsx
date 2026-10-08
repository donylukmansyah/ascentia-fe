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
      {/* Banner container matching Figma proportions (~420px height on desktop, compact on mobile) */}
      <div className="relative flex flex-col overflow-hidden lg:h-[430px] xl:h-[450px]">
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

        {/* Content layout: unified grid with proportional offsets matching Figma */}
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 py-9 sm:px-8 sm:py-12 lg:px-14 lg:py-0">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-12">
            {/* Left: "— Who We Are" upper-left */}
            <div className="lg:col-span-5 lg:pt-20">
              <h2
                id="who-we-are-heading"
                className="inline-flex items-center text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2.25rem]"
              >
                <span
                  className="mr-3 font-light text-white/80"
                  aria-hidden="true"
                >
                  —
                </span>
                <span>{heading}</span>
              </h2>
            </div>

            {/* Right: Paragraph + CTA lower-right, tight natural gap */}
            <div className="flex flex-col items-start gap-3.5 sm:gap-4 lg:col-span-7 lg:ml-auto lg:max-w-[420px] lg:pt-36">
              <p className="text-xs leading-relaxed font-light text-white/95 sm:text-[13px] lg:text-[13.5px]">
                {description}
              </p>
              <CtaLink to={ctaTo} size="compact" textTone="light">
                {ctaLabel}
              </CtaLink>
            </div>
          </div>
        </div>
      </div>

      {/* Integrated category ticker banner at the bottom */}
      {showCategoryTicker && <CategoryNav />}
    </section>
  )
}
