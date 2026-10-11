import { AboutCompanySection } from '../components/company-section'
import { AboutCustomersSection } from '../components/customers-section'
import { AboutGallerySection } from '../components/gallery/gallery-section'
import { AboutHeroSection } from '../components/hero-section'
import { AboutLocationsSection } from '../components/locations/locations-section'
import { AboutPartnersSection } from '../components/partners/partners-section'
import { AboutStatsBand } from '../components/stats-band'
import { AboutVisionMissionSection } from '../components/vision-mission/vision-mission-section'

export function AboutPage() {
  return (
    <>
      <AboutHeroSection imagePosition="center 90px " />
      <AboutCompanySection />
      <AboutVisionMissionSection />
      <AboutLocationsSection />
      <AboutPartnersSection />
      <AboutCustomersSection />
      <AboutStatsBand />
      <AboutGallerySection />
    </>
  )
}
