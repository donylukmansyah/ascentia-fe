import { PageHero } from '#/components/ui/page-hero'

import { aboutHeroContent } from '../constants/hero'

interface AboutHeroSectionProps {
  imagePosition?: string
  parallaxRange?: number
}

export function AboutHeroSection({
  imagePosition = 'center 20%',
  parallaxRange = 80,
}: AboutHeroSectionProps = {}) {
  return (
    <PageHero
      {...aboutHeroContent}
      headingId="about-hero-heading"
      contentHref="#about-content"
      imagePosition={imagePosition}
      parallaxRange={parallaxRange}
    />
  )
}
