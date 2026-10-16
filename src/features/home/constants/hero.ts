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
