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
      className="relative isolate overflow-hidden bg-foreground text-white"
    >
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 -z-20 overflow-hidden"
        aria-hidden="true"
      >
        <img
          src={image}
          alt=""
          loading="lazy"
          className="size-full object-cover object-center brightness-95"
        />
      </div>

      {/* Dark Overlay Layer */}
      <div
        className="absolute inset-0 -z-10 bg-[#252525]/60"
        aria-hidden="true"
      />

      {/* Reusable Noise Layer */}
      <div
        className="hero-carousel__noise pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-16">
          {/* Left: Heading with decorative dash */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <span
                className="h-[2px] w-6 shrink-0 bg-white/80 sm:w-8"
                aria-hidden="true"
              />
              <h2
                id="who-we-are-heading"
                className="text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl sm:tracking-normal lg:text-4xl"
              >
                {heading}
              </h2>
            </div>
          </div>

          {/* Right: Description & CTA */}
          <div className="flex flex-col items-start lg:col-span-7">
            <p className="max-w-2xl text-sm leading-relaxed font-normal text-white/90 sm:text-base">
              {description}
            </p>
            <div className="mt-6 sm:mt-8">
              <CtaLink to={ctaTo} size="compact" textTone="light">
                {ctaLabel}
              </CtaLink>
            </div>
          </div>
        </div>
      </div>

      {/* Integrated category marquee banner at bottom */}
      {showCategoryTicker && <CategoryNav />}
    </section>
  )
}
