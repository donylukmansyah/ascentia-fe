import { PageHero } from '#/components/ui/page-hero'
import { useLanguage } from '#/lib/i18n'

import { aboutHeroContent } from '../constants/hero'

interface AboutHeroSectionProps {
  imagePosition?: string
  parallaxRange?: number
}

export function AboutHeroSection({
  imagePosition = 'center 20%',
  parallaxRange = 80,
}: AboutHeroSectionProps = {}) {
  const { t } = useLanguage()

  return (
    <PageHero
      {...aboutHeroContent}
      title={t('about.hero.title', aboutHeroContent.title)}
      description={t('about.hero.description', aboutHeroContent.description)}
      headingId="about-hero-heading"
      contentHref="#about-content"
      imagePosition={imagePosition}
      parallaxRange={parallaxRange}
    />
  )
}
