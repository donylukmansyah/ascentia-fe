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
      {/* Background photo */}
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

      {/* Content wrapper with unified cohesive spacing (no gaping vertical voids) */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-14 sm:px-10 sm:py-18 lg:px-14 lg:py-22">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
          {/* Left: Heading upper-left */}
          <div className="lg:col-span-5">
            <h2
              id="who-we-are-heading"
              className="inline-flex items-center text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.65rem]"
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

          {/* Right: Controlled gap, aligned offset */}
          <div className="flex flex-col items-start gap-5 lg:col-span-7 lg:ml-auto lg:max-w-xl lg:pt-8">
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
