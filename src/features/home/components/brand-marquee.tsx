import { LogoMarquee } from '#/components/ui/logo-marquee'

import { brandPartners } from '../constants/brand-partners'

interface BrandMarqueeProps {
  title?: string
}

export function BrandMarquee({
  title = 'Brands we represent',
}: BrandMarqueeProps) {
  return (
    <section
      aria-label={title}
      className="border-b border-border bg-background py-8 sm:py-9"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mb-6 flex items-center gap-4">
          <h2 className="shrink-0 text-xs font-bold tracking-[0.14em] text-[#1E3A5F] uppercase">
            {title}
          </h2>
          <span className="h-px w-14 bg-border" aria-hidden="true" />
        </div>

        <LogoMarquee
          label={title}
          items={brandPartners.map((brand) => ({
            src: brand.logo,
            alt: brand.name,
          }))}
          itemClassName="h-7 sm:h-8"
          imgClassName="grayscale opacity-65 transition-[filter,opacity] duration-300 hover:grayscale-0 hover:opacity-100 motion-reduce:transition-none"
        />
      </div>
    </section>
  )
}
