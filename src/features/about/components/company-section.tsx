import { Reveal } from '#/components/ui/reveal'
import { useLanguage } from '#/lib/i18n'

import { aboutCompanyContent } from '../constants/company'

interface AboutCompanySectionProps {
  eyebrow?: string
  title?: string
  paragraphs?: readonly string[]
}

export function AboutCompanySection({
  eyebrow,
  title,
  paragraphs,
}: AboutCompanySectionProps) {
  const { t } = useLanguage()
  const resolvedEyebrow =
    eyebrow ?? t('about.company.eyebrow', aboutCompanyContent.eyebrow)
  const resolvedTitle =
    title ?? t('about.company.title', aboutCompanyContent.title)
  const resolvedParagraphs = paragraphs ?? [
    t('about.company.paragraph1', aboutCompanyContent.paragraphs[0]),
    t('about.company.paragraph2', aboutCompanyContent.paragraphs[1]),
  ]

  return (
    <section
      id="about-content"
      aria-labelledby="about-company-heading"
      className="bg-background py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 sm:px-8 lg:flex-row lg:items-center lg:gap-16 lg:px-12">
        <div className="relative w-full pb-10 sm:pb-14 lg:max-w-[520px] lg:shrink-0">
          <Reveal variant="right" distance={40} duration={0.6}>
            <div className="relative w-[80%] overflow-hidden rounded-[2px] shadow-sm">
              <img
                src={aboutCompanyContent.mainImage.src}
                alt={aboutCompanyContent.mainImage.alt}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-cover"
              />
              <div
                className="hero-carousel__noise pointer-events-none absolute inset-0"
                aria-hidden="true"
              />
            </div>
          </Reveal>

          <div className="absolute right-0 bottom-0 z-10 w-[46%]">
            <Reveal variant="up" distance={40} delay={0.2} duration={0.6}>
              <div className="border-4 border-white bg-white shadow-xl sm:border-[6px]">
                <div className="relative overflow-hidden">
                  <img
                    src={aboutCompanyContent.overlapImage.src}
                    alt={aboutCompanyContent.overlapImage.alt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div
                    className="hero-carousel__noise pointer-events-none absolute inset-0"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal
          variant="up"
          distance={30}
          delay={0.12}
          className="w-full max-w-2xl"
        >
          <p className="text-[10px] font-bold tracking-[0.12em] text-primary uppercase sm:text-[11px]">
            {resolvedEyebrow}
          </p>
          <h2
            id="about-company-heading"
            className="mt-2 text-[clamp(1.75rem,2.9vw,2.5rem)] leading-[1.04] font-bold tracking-[-0.045em] text-foreground"
          >
            {resolvedTitle}
          </h2>
          {resolvedParagraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="mt-4 text-sm leading-relaxed font-normal text-description-text sm:text-base"
            >
              {paragraph}
            </p>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
