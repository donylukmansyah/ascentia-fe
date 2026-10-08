import { createFileRoute } from '@tanstack/react-router'

import { BrandMarquee } from '#/features/home/brand-marquee'
import { HeroSection } from '#/features/home/hero-section'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <HeroSection />
      <BrandMarquee />
    </>
  )
}
