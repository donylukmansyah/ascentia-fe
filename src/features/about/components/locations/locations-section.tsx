import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'

import {
  MarkerCard,
  MarkerPin,
  OfficeMap,
  OfficeMarker,
} from '#/components/ui/map'
import { Reveal } from '#/components/ui/reveal'
import { cn } from '#/lib/utils'
import { useLanguage } from '#/lib/i18n'

import { aboutLocationsContent } from '../../constants/locations'
import { OfficePopupCard } from './office-popup-card'

interface AboutLocationsSectionProps {
  eyebrow?: string
  title?: string
  description?: string
  contained?: boolean
}

// Top fade keeps header legible over map.
const topFadeClassName =
  'pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,var(--background)_0%,transparent_59%)]'

export function AboutLocationsSection({
  eyebrow,
  title,
  description,
  contained = false,
}: AboutLocationsSectionProps) {
  const { t } = useLanguage()
  const resolvedEyebrow =
    eyebrow ?? t('about.locations.eyebrow', aboutLocationsContent.eyebrow)
  const resolvedTitle =
    title ?? t('about.locations.title', aboutLocationsContent.title)
  const resolvedDescription =
    description ??
    t('about.locations.description', aboutLocationsContent.description)

  // Small screens get a wider framing so both pins stay visible.
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)')
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return (
    <section
      aria-labelledby="about-locations-heading"
      className="relative isolate overflow-hidden bg-background"
    >
      <div
        className={cn(
          'relative',
          contained
            ? 'h-[560px] sm:h-[500px] lg:h-[520px]'
            : 'h-[640px] sm:h-[600px] lg:h-[625px]',
        )}
      >
        <div className="absolute inset-0">
          <OfficeMap
            key={isMobile ? 'mobile' : 'desktop'}
            viewport={
              isMobile
                ? {
                    ...aboutLocationsContent.mobileViewport,
                    zoom: contained
                      ? 3.1
                      : aboutLocationsContent.mobileViewport.zoom,
                  }
                : aboutLocationsContent.viewport
            }
          >
            {aboutLocationsContent.offices.map((office) => (
              <OfficeMarker
                key={office.id}
                longitude={office.longitude}
                latitude={office.latitude}
              >
                <MarkerPin>
                  <button
                    type="button"
                    aria-label={`Lihat info kantor ${office.label}`}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full bg-foreground py-1 pr-3 pl-1 text-xs font-medium text-background shadow-lg transition-transform duration-200 ease-out outline-none hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:hover:scale-100"
                  >
                    <span className="relative flex size-4">
                      <MapPin className="size-4" aria-hidden="true" />
                      <span
                        aria-hidden="true"
                        className="absolute -top-0.5 -right-0.5 flex size-2"
                      >
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
                        <span className="relative inline-flex size-2 rounded-full bg-primary" />
                      </span>
                    </span>
                    {office.label}
                  </button>
                </MarkerPin>
                <MarkerCard popupClassName="office-popup">
                  <OfficePopupCard office={office} />
                </MarkerCard>
              </OfficeMarker>
            ))}
          </OfficeMap>
        </div>
        <div aria-hidden="true" className={topFadeClassName} />
        <div className="pointer-events-none absolute inset-x-0 top-0">
          <div
            className={cn(
              'mx-auto w-full max-w-7xl',
              contained
                ? 'px-5 pt-8 sm:px-8 sm:pt-10 lg:px-9 lg:pt-12'
                : 'px-5 pt-14 sm:px-8 sm:pt-16 lg:px-12 lg:pt-20',
            )}
          >
            <Reveal
              variant="up"
              className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
            >
              <div className="max-w-2xl">
                <p className="section-kicker">{resolvedEyebrow}</p>
                <h2 id="about-locations-heading" className="section-title mt-2">
                  {resolvedTitle}
                </h2>
              </div>
              <p className="section-description max-w-md lg:pb-2 lg:text-right">
                {resolvedDescription}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
