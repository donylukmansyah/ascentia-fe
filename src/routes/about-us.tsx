import { createFileRoute } from '@tanstack/react-router'

import { AboutHeroSection } from '#/features/about/about-hero-section'
import { AboutLocationsSection } from '#/features/about/about-locations-section'
import { AboutPartnerSection } from '#/features/about/about-partner-section'
import { AboutPartnersSection } from '#/features/about/about-partners-section'
import { AboutVisionMissionSection } from '#/features/about/about-vision-mission-section'

export const Route = createFileRoute('/about-us')({ component: AboutUs })

function AboutUs() {
  return (
    <>
      <AboutHeroSection imagePosition="center 90px " />
      <AboutPartnerSection />
      <AboutVisionMissionSection />
      <AboutLocationsSection />
      <AboutPartnersSection />
    </>
  )
}
