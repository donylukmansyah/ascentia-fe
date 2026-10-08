import { createFileRoute } from '@tanstack/react-router'

import { ContactPanel } from '#/features/contact/contact-panel'
import { BrandMarquee } from '#/features/home/brand-marquee'
import { FeaturedProductsSection } from '#/features/home/featured-products-section'
import { HeroSection } from '#/features/home/hero-section'
import { WhoWeAreSection } from '#/features/home/who-we-are-section'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <HeroSection />
      <BrandMarquee />
      <WhoWeAreSection />
      <FeaturedProductsSection />
      <ContactPanel className="bg-muted py-16 sm:py-20 lg:py-24" />
    </>
  )
}
