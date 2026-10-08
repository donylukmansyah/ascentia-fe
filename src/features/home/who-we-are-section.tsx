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
  return (
    <section
      aria-labelledby="who-we-are-heading"
      className="relative isolate w-full overflow-hidden bg-foreground text-white"
    >
      <div className="relative flex min-h-[460px] flex-col justify-between overflow-hidden sm:min-h-[520px] lg:min-h-[620px] lg:h-[630px] xl:h-[650px]">
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

        <div
          className="absolute inset-0 -z-10 bg-[#202224]/60"
          aria-hidden="true"
        />
        <div
          className="hero-carousel__noise pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16 lg:px-14 lg:pt-20 xl:pt-24">
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
          <div className="ml-auto flex w-full max-w-sm flex-col items-start gap-3.5 sm:max-w-md sm:gap-4 lg:max-w-[550px] xl:max-w-[550px]">
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
