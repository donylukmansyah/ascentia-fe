import { ContactPanel } from '#/features/contact/components/contact-panel'
import { ProductCarouselSection } from '#/features/products/components/product-carousel-section'

import { BrandMarquee } from '../components/brand-marquee'
import { HeroSection } from '../components/hero-section'
import { WhoWeAreSection } from '../components/who-we-are-section'

export function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandMarquee />
      <WhoWeAreSection />
      <ProductCarouselSection />
      <ContactPanel className="bg-[#F7F9FC] py-16 sm:py-20 lg:py-24" />
    </>
  )
}
