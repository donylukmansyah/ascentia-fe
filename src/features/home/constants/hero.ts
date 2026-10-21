import { useLanguage } from '#/lib/i18n'

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
    eyebrow: 'Precision Sample Preparation & Fusion',
    titleLines: ['Laboratory and', 'Equipment'],
    highlight: 'Distributor',
    description:
      'Electric and gas fusion machines engineered for zero-defect fused bead repeatability in high-throughput XRF and ICP analysis.',
    image: '/images/homepage/xrf-home.webp',
    imagePosition: 'center 48%',
    ctaLabel: 'Explore Instruments',
    ctaTo: '/products/brands',
  },
  {
    id: 'particle-analysis',
    label: 'Particle Analysis',
    eyebrow: 'Milling & Particle Characterization',
    titleLines: ['Advanced Milling &', 'Particle Sizing'],
    highlight: 'Solutions',
    description:
      'Application-specific laboratory instruments for reliable particle characterization across mining, metallurgy, and industrial research.',
    image: '/images/homepage/assets-home.webp',
    imagePosition: 'center 46%',
    ctaLabel: 'Explore Instruments',
    ctaTo: '/products/brands',
  },
  {
    id: 'reference-materials',
    label: 'Reference Materials',
    eyebrow: 'OREAS & Brammer Standard CRMs',
    titleLines: ['Certified', 'Reference'],
    highlight: 'Materials',
    description:
      'World-leading matrix-matched reference materials supporting rigorous quality control and method validation in global mining.',
    image: '/images/homepage/xrf-home.webp',
    imagePosition: 'center 58%',
    ctaLabel: 'Explore Standards',
    ctaTo: '/products/brands',
  },
  {
    id: 'spectroscopy',
    label: 'Spectroscopy',
    eyebrow: 'Thermal Analysis & Spectrometry',
    titleLines: ['High-Throughput TGA &', 'Field Portable'],
    highlight: 'Spectrometers',
    description:
      'Macro thermogravimetric analysers and rugged portable spectrometers designed for real-time mineral and materials verification.',
    image: '/images/homepage/assets-home.webp',
    imagePosition: 'center 55%',
    ctaLabel: 'Explore Instruments',
    ctaTo: '/products/brands',
  },
]

export function useHeroSlides(): HeroSlide[] {
  const { t } = useLanguage()
  return [
    {
      id: 'sample-preparation',
      label: t('home.hero.samplePrep.label', heroSlides[0].label),
      eyebrow: t('home.hero.samplePrep.eyebrow', heroSlides[0].eyebrow),
      titleLines: [
        t('home.hero.samplePrep.titleLine1', heroSlides[0].titleLines[0]),
        t('home.hero.samplePrep.titleLine2', heroSlides[0].titleLines[1]),
      ],
      highlight: t('home.hero.samplePrep.highlight', heroSlides[0].highlight),
      description: t(
        'home.hero.samplePrep.description',
        heroSlides[0].description,
      ),
      image: heroSlides[0].image,
      imagePosition: heroSlides[0].imagePosition,
      ctaLabel: t('home.hero.samplePrep.cta', heroSlides[0].ctaLabel),
      ctaTo: heroSlides[0].ctaTo,
    },
    {
      id: 'particle-analysis',
      label: t('home.hero.particleAnalysis.label', heroSlides[1].label),
      eyebrow: t('home.hero.particleAnalysis.eyebrow', heroSlides[1].eyebrow),
      titleLines: [
        t('home.hero.particleAnalysis.titleLine1', heroSlides[1].titleLines[0]),
        t('home.hero.particleAnalysis.titleLine2', heroSlides[1].titleLines[1]),
      ],
      highlight: t(
        'home.hero.particleAnalysis.highlight',
        heroSlides[1].highlight,
      ),
      description: t(
        'home.hero.particleAnalysis.description',
        heroSlides[1].description,
      ),
      image: heroSlides[1].image,
      imagePosition: heroSlides[1].imagePosition,
      ctaLabel: t('home.hero.particleAnalysis.cta', heroSlides[1].ctaLabel),
      ctaTo: heroSlides[1].ctaTo,
    },
    {
      id: 'reference-materials',
      label: t('home.hero.referenceMaterials.label', heroSlides[2].label),
      eyebrow: t('home.hero.referenceMaterials.eyebrow', heroSlides[2].eyebrow),
      titleLines: [
        t(
          'home.hero.referenceMaterials.titleLine1',
          heroSlides[2].titleLines[0],
        ),
        t(
          'home.hero.referenceMaterials.titleLine2',
          heroSlides[2].titleLines[1],
        ),
      ],
      highlight: t(
        'home.hero.referenceMaterials.highlight',
        heroSlides[2].highlight,
      ),
      description: t(
        'home.hero.referenceMaterials.description',
        heroSlides[2].description,
      ),
      image: heroSlides[2].image,
      imagePosition: heroSlides[2].imagePosition,
      ctaLabel: t('home.hero.referenceMaterials.cta', heroSlides[2].ctaLabel),
      ctaTo: heroSlides[2].ctaTo,
    },
    {
      id: 'spectroscopy',
      label: t('home.hero.spectroscopy.label', heroSlides[3].label),
      eyebrow: t('home.hero.spectroscopy.eyebrow', heroSlides[3].eyebrow),
      titleLines: [
        t('home.hero.spectroscopy.titleLine1', heroSlides[3].titleLines[0]),
        t('home.hero.spectroscopy.titleLine2', heroSlides[3].titleLines[1]),
      ],
      highlight: t('home.hero.spectroscopy.highlight', heroSlides[3].highlight),
      description: t(
        'home.hero.spectroscopy.description',
        heroSlides[3].description,
      ),
      image: heroSlides[3].image,
      imagePosition: heroSlides[3].imagePosition,
      ctaLabel: t('home.hero.spectroscopy.cta', heroSlides[3].ctaLabel),
      ctaTo: heroSlides[3].ctaTo,
    },
  ]
}
