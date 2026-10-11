import { ContactPanel } from '#/features/contact/components/contact-panel'

import { BrandMarquee } from '../components/brand-marquee'
import { FeaturedProductsSection } from '../components/featured-products-section'
import { HeroSection } from '../components/hero-section'
import { WhoWeAreSection } from '../components/who-we-are-section'

export function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandMarquee />
      <WhoWeAreSection />
      <FeaturedProductsSection />
      <ContactPanel className="bg-[#F7F9FC] py-16 sm:py-20 lg:py-24" />
    </>
  )
}
