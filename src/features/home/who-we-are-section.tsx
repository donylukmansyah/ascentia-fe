import { CtaLink } from '#/components/ui/cta-link'

import { CategoryNav } from './category-nav'

interface WhoWeAreSectionProps {
  image?: string
  headingLine1?: string
  headingLine2?: string
  description?: string
  ctaLabel?: string
  ctaTo?: string
  showCategoryTicker?: boolean
}

const DEFAULT_IMAGE = '/images/products/assets-products.webp'
const DEFAULT_HEADING_1 = 'WHO WE'
const DEFAULT_HEADING_2 = 'ARE'
const DEFAULT_DESCRIPTION =
  'PT Ascentia Arsya Analitika delivers analytical instruments and laboratory equipment across Indonesia, combining trusted global brands, technical expertise, application training, and continuous support for research, education, mining, and industry.'

export function WhoWeAreSection({
  image = DEFAULT_IMAGE,
  headingLine1 = DEFAULT_HEADING_1,
  headingLine2 = DEFAULT_HEADING_2,
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
      {/* Spacious cinematic banner container (matches 2:1 reference ratio) */}
      <div className="relative flex min-h-[540px] flex-col justify-between overflow-hidden sm:min-h-[620px] lg:min-h-[680px] lg:h-[68vh] xl:min-h-[760px] max-h-[880px]">
        {/* Background photo */}
        <div
          className="absolute inset-0 -z-20 overflow-hidden"
          aria-hidden="true"
        >
          <img
            src={image}
            alt=""
            loading="lazy"
            className="size-full object-cover object-center brightness-90 contrast-[1.05]"
          />
        </div>

        {/* Dark overlay */}
        <div
          className="absolute inset-0 -z-10 bg-black/55 sm:bg-[#1a1c1e]/60"
          aria-hidden="true"
        />

        {/* Subtle noise texture */}
        <div
          className="hero-carousel__noise pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        />

        {/* Top-left: Large two-line display heading */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-12 sm:px-10 sm:pt-16 lg:px-16 lg:pt-20">
          <h2
            id="who-we-are-heading"
            className="text-4xl font-light tracking-tight text-white uppercase sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            <span className="block">{headingLine1}</span>
            <span className="block font-medium">{headingLine2}</span>
          </h2>
        </div>

        {/* Lower-right: Paragraph & CTA button */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-12 sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
          <div className="ml-auto flex max-w-md flex-col items-start gap-5 sm:max-w-lg sm:gap-6 lg:max-w-[480px]">
            <p className="text-sm leading-relaxed font-light text-white/90 sm:text-base lg:text-[17px]">
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
