import AOS from 'aos'
import 'aos/dist/aos.css'
import { useEffect } from 'react'

import { ContactPanel } from '#/features/contact/components/contact-panel'

import { BrandMarquee } from '../components/brand-marquee'
import { FeaturedProductsSection } from '../components/featured-products-section'
import { HeroSection } from '../components/hero-section'
import { WhoWeAreSection } from '../components/who-we-are-section'

// AOS keeps a global store and listeners: init once, re-collect nodes on remount.
let isAosInitialized = false

export function HomePage() {
  useEffect(() => {
    AOS.init({
      once: true,
      offset: 120,
      duration: 600,
      // disable strips data-aos so content stays visible without motion.
      disable: () =>
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    })

    if (isAosInitialized) {
      AOS.refreshHard()
    } else {
      AOS.refresh()
      isAosInitialized = true
    }
  }, [])

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
