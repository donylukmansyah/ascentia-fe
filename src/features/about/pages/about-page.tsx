import { AboutCompanySection } from '../components/company-section'
import { AboutHeroSection } from '../components/hero-section'
import { AboutLocationsSection } from '../components/locations-section'
import { AboutPartnersSection } from '../components/partners-section'
import { AboutVisionMissionSection } from '../components/vision-mission-section'

export function AboutPage() {
  return (
    <>
      <AboutHeroSection imagePosition="center 90px " />
      <AboutCompanySection />
      <AboutVisionMissionSection />
      <AboutLocationsSection />
      <AboutPartnersSection />
    </>
  )
}
