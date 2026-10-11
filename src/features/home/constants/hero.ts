export type HeroSlide = {
  id: string
  label: string
  eyebrow: string
  titleLines: [string, string]
  highlight: string
  description: string
  image: string
  imagePosition?: string
  ctaLabel: string
  ctaTo: string
}

export const heroSlides: HeroSlide[] = [
  {
    id: 'sample-preparation',
    label: 'Sample Preparation',
    eyebrow: 'Analytical Laboratory Solutions',
    titleLines: ['Laboratory and', 'Equipment'],
    highlight: 'Distributor',
    description:
      'Your trusted partner in analytical instrumentation and laboratory equipment.',
    image: '/images/homepage/xrf-home.webp',
    imagePosition: 'center 48%',
    ctaLabel: 'Explore Products',
    ctaTo: '/products',
  },
  {
    id: 'particle-analysis',
    label: 'Particle Analysis',
    eyebrow: 'Precision in Every Measurement',
    titleLines: ['Advanced Particle', 'Analysis'],
    highlight: 'Solutions',
    description:
      'Reliable instruments and expertise for precise particle characterization.',
    image: '/images/homepage/assets-home.webp',
    imagePosition: 'center 46%',
    ctaLabel: 'Explore Products',
    ctaTo: '/products',
  },
  {
    id: 'reference-materials',
    label: 'Reference Materials',
    eyebrow: 'Confident Results Start Here',
    titleLines: ['Certified', 'Reference'],
    highlight: 'Materials',
    description:
      'Quality reference materials to support accurate, repeatable laboratory results.',
    image: '/images/homepage/xrf-home.webp',
    imagePosition: 'center 58%',
    ctaLabel: 'Explore Products',
    ctaTo: '/products',
  },
  {
    id: 'spectroscopy',
    label: 'Spectroscopy',
    eyebrow: 'Technology for Better Decisions',
    titleLines: ['Discover', 'Analytical'],
    highlight: 'Spectroscopy',
    description:
      'Explore analytical technologies designed for demanding laboratory workflows.',
    image: '/images/homepage/assets-home.webp',
    imagePosition: 'center 55%',
    ctaLabel: 'Explore Products',
    ctaTo: '/products',
  },
]
