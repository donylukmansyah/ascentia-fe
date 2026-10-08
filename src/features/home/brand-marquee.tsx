import { brandPartners } from './brand-partners'

interface BrandMarqueeProps {
  title?: string
}

// 3x duplicate per block ensures track width always exceeds any wide screen
const marqueeItems = [...brandPartners, ...brandPartners, ...brandPartners]

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

        <div
          className="brand-marquee group relative overflow-hidden"
          tabIndex={0}
        >
          <div className="brand-marquee__track">
            {[false, true].map((isDuplicate) => (
              <div
                key={String(isDuplicate)}
                className="brand-marquee__content"
                aria-hidden={isDuplicate}
              >
                {marqueeItems.map((brand, index) => (
                  <div
                    key={`${brand.name}-${index}`}
                    className="flex h-7 shrink-0 items-center justify-center sm:h-8"
                  >
                    <img
                      src={brand.logo}
                      alt={isDuplicate ? '' : brand.name}
                      className="h-full w-auto max-w-none object-contain grayscale opacity-65 transition-[filter,opacity] duration-300 hover:grayscale-0 hover:opacity-100 motion-reduce:transition-none"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div
            className="brand-marquee__edge brand-marquee__edge--left"
            aria-hidden="true"
          />
          <div
            className="brand-marquee__edge brand-marquee__edge--right"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  )
}
