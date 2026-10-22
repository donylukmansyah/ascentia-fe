import { LogoMarquee } from '#/components/ui/logo-marquee'
import { Reveal } from '#/components/ui/reveal'
import { useLanguage } from '#/lib/i18n'

import { aboutCustomersContent } from '../constants/customers'

interface AboutCustomersSectionProps {
  title?: string
}

export function AboutCustomersSection({ title }: AboutCustomersSectionProps) {
  const { t } = useLanguage()
  const resolvedTitle =
    title ?? t('about.customers.title', aboutCustomersContent.title)

  return (
    <section
      aria-label={resolvedTitle}
      className="bg-background py-14 sm:py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal variant="up">
          <h2 className="text-center text-[clamp(1.75rem,2.9vw,2.5rem)] leading-[1.04] font-bold tracking-[-0.045em] text-foreground">
            {resolvedTitle}
          </h2>
        </Reveal>
        <Reveal
          variant="up"
          distance={20}
          delay={0.12}
          className="mt-8 sm:mt-10"
        >
          <LogoMarquee
            label={resolvedTitle}
            items={aboutCustomersContent.logos}
            durationSec={126}
          />
        </Reveal>
      </div>
    </section>
  )
}
