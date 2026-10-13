export const productTypes = [
  { id: 'instrument', name: 'Instrument' },
  { id: 'analytical', name: 'Analytical' },
  { id: 'consumables', name: 'Consumables' },
]

export const productApplications = [
  { id: 'lab-research', name: 'Lab Research' },
  { id: 'mining', name: 'Mining' },
]

export interface ProductBrand {
  id: string
  name: string
  logo?: string
}

// Dummy brand list until Woo taxonomies land.
export const productBrands: ProductBrand[] = [
  {
    id: 'xrf-scientific',
    name: 'XRF Scientific',
    logo: '/images/about-us/our-partner-logo/xrf-scientific.png',
  },
  {
    id: 'oreas',
    name: 'OREAS',
    logo: '/images/about-us/our-partner-logo/OREAS.png',
  },
  {
    id: 'brammer-standard',
    name: 'Brammer Standard',
    logo: '/images/about-us/our-partner-logo/Brammer-standard.png',
  },
  {
    id: 'kingyosion',
    name: 'Kingyosion',
    logo: '/images/about-us/our-partner-logo/King-YOSION.png',
  },
  {
    id: 'mettler-toledo',
    name: 'Mettler Toledo',
    logo: '/images/about-us/our-partner-logo/Mettler-Toledo.png',
  },
  {
    id: 'specac',
    name: 'Specac',
    logo: '/images/about-us/our-partner-logo/Specac-Science-Pulse.png',
  },
]
