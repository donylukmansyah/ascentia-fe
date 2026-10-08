import { createFileRoute } from '@tanstack/react-router'

import { HeroSection } from '#/components/sections/hero/hero-section'
import { BrandMarquee } from '#/features/brand-partners'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <HeroSection />
      <BrandMarquee />
    </>
  )
}
