import { MapPin } from 'lucide-react'

import { CtaLink } from '#/components/ui/cta-link'
import {
  MarkerCard,
  MarkerPin,
  OfficeMap,
  OfficeMarker,
} from '#/components/ui/map'
import { PageHero } from '#/components/ui/page-hero'
import { AboutLocationsSection } from '#/features/about/components/locations/locations-section'
import { aboutLocationsContent } from '#/features/about/constants/locations'

import { ContactPanel } from '../components/contact-panel'

const jakartaOffice = aboutLocationsContent.offices[0]
const jakartaDirectionsUrl =
  'https://www.google.com/maps/dir/?api=1&destination=PT+Ascentia+Arsya+Analitika&destination_place_id=ChIJAfPlzjL3aS4RJgkrqoECgtU'

export function ContactPage() {
  return (
    <>
      <PageHero
        headingId="contact-hero-heading"
        title="Contact Us"
        description="Analytical instruments, trusted materials, and technical support for the work that brings reliable results."
        image="/images/contact-us/contact-us.webp"
        imagePosition="55% 48%"
        contentHref="#contact-content"
      />
      <ContactPanel
        id="contact-content"
        className="relative z-10 -mt-16 scroll-mt-28 pb-14 outline-none sm:-mt-20 sm:pb-16 lg:-mt-24 lg:pb-20"
        officeHash="jakarta-map"
        showPageLink={false}
      />
      <div className="mx-auto w-full max-w-7xl px-5 pb-14 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
        <AboutLocationsSection
          contained
          title="Closer to where the work happens."
          description="Our Jakarta and Kendari offices serve laboratories and industrial teams across Indonesia."
        />
      </div>
      <section
        id="jakarta-map"
        tabIndex={-1}
        aria-labelledby="jakarta-map-heading"
        className="relative isolate scroll-mt-28 bg-[#F7F9FC] outline-none"
      >
        <div className="pointer-events-none relative z-10 mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:absolute lg:inset-x-0 lg:top-12 lg:px-12 lg:py-0">
          <div
            aria-labelledby="jakarta-map-heading"
            className="pointer-events-auto flex flex-col gap-5 lg:w-[360px] lg:rounded-xl lg:bg-background lg:p-6 lg:shadow-md"
          >
            <div>
              <p className="text-[10px] font-bold tracking-[0.12em] text-primary uppercase sm:text-[11px]">
                Jakarta · Head Office
              </p>
              <h2
                id="jakarta-map-heading"
                className="mt-2 text-xl leading-snug font-bold tracking-[-0.03em] text-foreground sm:text-2xl"
              >
                PT Ascentia Arsya Analitika
              </h2>
              <address className="mt-3 max-w-xl text-sm leading-relaxed text-description-text not-italic sm:text-base">
                {jakartaOffice.address}
              </address>
            </div>
            <CtaLink
              to={jakartaDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-fit lg:w-full"
            >
              Get directions
            </CtaLink>
          </div>
        </div>
        <div className="relative h-[380px] w-full sm:h-[480px] lg:h-[540px]">
          <OfficeMap
            viewport={{
              center: [jakartaOffice.longitude, jakartaOffice.latitude],
              zoom: 15,
            }}
            className="h-full w-full"
          >
            <OfficeMarker
              longitude={jakartaOffice.longitude}
              latitude={jakartaOffice.latitude}
              anchor="bottom"
            >
              <MarkerPin>
                <button
                  type="button"
                  aria-label="Lihat info kantor Jakarta"
                  className="flex cursor-pointer items-center justify-center rounded-full text-primary drop-shadow-md transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:hover:scale-100"
                >
                  <MapPin
                    aria-hidden="true"
                    className="size-10 fill-primary stroke-white"
                  />
                </button>
              </MarkerPin>
              <MarkerCard defaultOpen closeButton>
                <div className="max-w-[min(220px,65vw)] px-2 py-1 pr-6 font-sans">
                  <p className="text-sm font-semibold text-foreground">
                    PT Ascentia Arsya Analitika
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Head Office · Jakarta
                  </p>
                </div>
              </MarkerCard>
            </OfficeMarker>
          </OfficeMap>
        </div>
      </section>
    </>
  )
}
