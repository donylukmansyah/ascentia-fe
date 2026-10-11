export interface AboutPartner {
  id: string
  name: string
  description: string
  logo: string
  logoWhite: string
  logoAlt: string
  image: string
  imageAlt: string
  imageWidth: number
  imageHeight: number
}

export const aboutPartnersContent = {
  eyebrow: 'Our Partner',
  title: 'Capabilities built with specialists.',
  description:
    'We represent specialist brands across analytical instrumentation, sample preparation, reference materials, and precision measurement.',
  sideImage: {
    src: '/images/about-us/foto-5.webp',
    alt: 'Ascentia exhibition booth with visitors',
  },
  partners: [
    {
      id: 'xrf-scientific',
      name: 'XRF Scientific',
      description:
        'High-performance fusion and sample preparation instruments for dependable XRF analysis.',
      logo: '/images/about-us/our-partner-logo/xrf-scientific.png',
      logoWhite: '/images/about-us/our-partner-logo-white/xrf-scientific.png',
      logoAlt: 'XRF Scientific logo',
      image: '/images/about-us/foto-5.webp',
      imageAlt: 'XRF Scientific exhibition booth with visitors',
      imageWidth: 921,
      imageHeight: 614,
    },
    {
      id: 'oreas',
      name: 'OREAS',
      description:
        'Certified reference materials for quality control in mining and exploration.',
      logo: '/images/about-us/our-partner-logo/OREAS.png',
      logoWhite: '/images/about-us/our-partner-logo-white/Oreas.png',
      logoAlt: 'OREAS logo',
      image: '/images/about-us/foto-3.webp',
      imageAlt: 'Grand opening event of Dynatech International Kendari branch',
      imageWidth: 1043,
      imageHeight: 540,
    },
    {
      id: 'specac',
      name: 'Specac',
      description:
        'Precision sample preparation and optical components for spectroscopy.',
      logo: '/images/about-us/our-partner-logo/Specac-Science-Pulse.png',
      logoWhite: '/images/about-us/our-partner-logo-white/SPecac.png',
      logoAlt: 'Specac logo',
      image: '/images/about-us/foto-6.webp',
      imageAlt: 'Ascentia team group photo at a laboratory training event',
      imageWidth: 962,
      imageHeight: 641,
    },
    {
      id: 'mettler-toledo',
      name: 'Mettler Toledo',
      description:
        'Precision balances and analytical measurement for dependable results.',
      logo: '/images/about-us/our-partner-logo/Mettler-Toledo.png',
      logoWhite: '/images/about-us/our-partner-logo-white/Mettler-toledo.png',
      logoAlt: 'Mettler Toledo logo',
      image: '/images/about-us/foto-2.webp',
      imageAlt: 'Ascentia reception area with company logo',
      imageWidth: 663,
      imageHeight: 717,
    },
    {
      id: 'king-yosion',
      name: 'King Yosion',
      description:
        'Laboratory instruments supporting routine analytical workflows.',
      logo: '/images/about-us/our-partner-logo/King-YOSION.png',
      logoWhite: '/images/about-us/our-partner-logo-white/Kingyosion.png',
      logoAlt: 'King Yosion logo',
      image: '/images/about-us/foto-1.webp',
      imageAlt: 'Ascentia meeting room with presentation setup',
      imageWidth: 498,
      imageHeight: 540,
    },
    {
      id: 'brammer',
      name: 'Brammer Standard',
      description:
        'Certified reference standards for metals and materials analysis.',
      logo: '/images/about-us/our-partner-logo/Brammer-standard.png',
      logoWhite: '/images/about-us/our-partner-logo-white/Brammer-standard.png',
      logoAlt: 'Brammer Standard logo',
      image: '/images/about-us/foto-4.webp',
      imageAlt: 'Ascentia team meeting with a client in a meeting room',
      imageWidth: 547,
      imageHeight: 590,
    },
  ] as AboutPartner[],
} as const
