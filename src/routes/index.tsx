import { createFileRoute } from '@tanstack/react-router'

import { BrandMarquee } from '#/features/home/brand-marquee'
import { HeroSection } from '#/features/home/hero-section'
import { WhoWeAreSection } from '#/features/home/who-we-are-section'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <HeroSection />
      <BrandMarquee />
      <WhoWeAreSection />
    </>
  )
}
