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
  eyebrow: 'Official Principals',
  title: 'World-Class Technology from Trusted Partners',
  description:
    'Authorized distributor of world-class analytical instruments, sample fusion systems, and certified reference materials.',
  sideImage: {
    src: '/images/about-us/foto-5.webp',
    alt: 'Ascentia exhibition booth with visitors',
  },
  partners: [
    {
      id: 'xrf-scientific',
      name: 'XRF Scientific',
      description:
        'High-quality sample preparation equipment, chemicals, and analytical solutions for XRF workflows.',
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
        'Certified reference materials supporting reliable quality control across mining and exploration.',
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
        'Sample preparation and spectroscopy accessories for pharmaceutical, environmental, materials, and industrial laboratories.',
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
        'Precision instruments for weighing, analytical measurement, process control, and quality assurance.',
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
        'Laboratory instruments for sample preparation, testing, and routine analytical workflows.',
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
        'Certified reference materials for calibration, quality control, and method validation in spectrometric analysis.',
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
