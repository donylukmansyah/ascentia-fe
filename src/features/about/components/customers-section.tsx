import { LogoMarquee } from '#/components/ui/logo-marquee'
import { Reveal } from '#/components/ui/reveal'

import { aboutCustomersContent } from '../constants/customers'

interface AboutCustomersSectionProps {
  title?: string
}

export function AboutCustomersSection({
  title = aboutCustomersContent.title,
}: AboutCustomersSectionProps) {
  return (
    <section aria-label={title} className="bg-background py-14 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal variant="up">
          <h2 className="text-center text-[clamp(1.75rem,2.9vw,2.5rem)] leading-[1.04] font-bold tracking-[-0.045em] text-foreground">
            {title}
          </h2>
        </Reveal>
        <div className="mt-8 sm:mt-10">
          <LogoMarquee
            label={title}
            items={aboutCustomersContent.logos}
            durationSec={126}
          />
        </div>
      </div>
    </section>
  )
}
