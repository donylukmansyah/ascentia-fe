import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'

import {
  MarkerCard,
  MarkerPin,
  OfficeMap,
  OfficeMarker,
} from '#/components/ui/map'

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
      <div className="mx-auto w-full max-w-7xl px-5 pt-16 sm:px-8 sm:pt-20 lg:px-12 lg:pt-24">
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

        <div className="mt-10 h-[420px] overflow-hidden rounded-2xl border border-border shadow-sm">
          <OfficeMap viewport={aboutLocationsContent.viewport}>
            {aboutLocationsContent.offices.map((office) => (
              <OfficeMarker
                key={office.id}
                longitude={office.longitude}
                latitude={office.latitude}
              >
                <MarkerPin>
                  <span className="flex items-center gap-1.5 rounded-full bg-foreground py-1 pr-3 pl-1 text-xs font-medium text-background shadow-lg">
                    <MapPin className="size-4" aria-hidden="true" />
                    {office.label}
                  </span>
                </MarkerPin>
                <MarkerCard>
                  <img
                    src={office.photo}
                    alt={office.name}
                    loading="lazy"
                    decoding="async"
                    className="h-32 w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="text-sm font-bold">{office.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {office.address}
                    </p>
                    <div className="mt-3 grid gap-1.5 text-xs">
                      <a
                        href={`mailto:${office.email}`}
                        className="inline-flex cursor-pointer items-center gap-2 hover:text-primary"
                      >
                        <Mail
                          className="size-3.5 text-primary"
                          aria-hidden="true"
                        />
                        {office.email}
                      </a>
                      <a
                        href={office.phoneHref}
                        className="inline-flex cursor-pointer items-center gap-2 hover:text-primary"
                      >
                        <Phone
                          className="size-3.5 text-primary"
                          aria-hidden="true"
                        />
                        {office.phone}
                      </a>
                      <a
                        href={office.whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex cursor-pointer items-center gap-2 hover:text-primary"
                      >
                        <MessageCircle
                          className="size-3.5 text-primary"
                          aria-hidden="true"
                        />
                        {office.whatsapp}
                      </a>
                      <a
                        href={office.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex cursor-pointer items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  </div>
                </MarkerCard>
              </OfficeMarker>
            ))}
          </OfficeMap>
        </div>
      </div>
    </section>
  )
}
