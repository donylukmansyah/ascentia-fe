import { aboutLocationsContent } from '../constants/locations'

interface AboutLocationsSectionProps {
  eyebrow?: string
  title?: string
  description?: string
}

export function AboutLocationsSection({
  eyebrow = aboutLocationsContent.eyebrow,
  title = aboutLocationsContent.title,
  description = aboutLocationsContent.description,
}: AboutLocationsSectionProps) {
  return (
    <section
      aria-labelledby="about-locations-heading"
      className="relative isolate overflow-hidden bg-background"
    >
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <img
          src={aboutLocationsContent.image.src}
          alt={aboutLocationsContent.image.alt}
          loading="lazy"
          decoding="async"
          className="size-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background from-0% to-transparent to-[59%]" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 pt-16 pb-64 sm:px-8 sm:pt-20 sm:pb-80 lg:px-12 lg:pt-24 lg:pb-96">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold tracking-[0.12em] text-primary uppercase sm:text-[11px]">
              {eyebrow}
            </p>
            <h2
              id="about-locations-heading"
              className="mt-2 text-[clamp(2rem,3.4vw,3rem)] leading-[1.04] font-bold tracking-[-0.045em] text-foreground"
            >
              {title}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed font-normal text-description-text sm:text-base lg:pb-2 lg:text-right">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
