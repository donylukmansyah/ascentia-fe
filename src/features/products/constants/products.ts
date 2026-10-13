import type { ProductCardData, ProductDetailData } from '../types/product'

export const mockProducts: ProductCardData[] = [
  {
    id: 'xrfuse-2',
    slug: 'xrfuse-2',
    name: 'xrFuse 2 Automatic Electric Fusion Machine - 2 Positions',
    brand: 'XRF SCIENTIFIC',
    brandId: 'xrf-scientific',
    typeId: 'instrument',
    applicationIds: ['lab-research', 'mining'],
    image: '/images/products/xrfuse-2.png',
    category: 'Fusion equipment',
    application: 'XRF analysis',
    shortDescription:
      'Two-position automated electric fusion instrument designed for precision sample preparation.',
  },
  {
    id: 'xrfuse-6',
    slug: 'xrfuse-6',
    name: 'xrFuse 6 automatic electric fusion machine',
    brand: 'XRF SCIENTIFIC',
    brandId: 'xrf-scientific',
    typeId: 'instrument',
    applicationIds: ['lab-research', 'mining'],
    image: '/images/products/xrfuse-6.png',
    category: 'Fusion equipment',
    application: 'XRF analysis',
    shortDescription:
      'Six-position automated electric fusion system offering high-throughput laboratory performance.',
  },
  {
    id: 'phoenix-go-4',
    slug: 'phoenix-go-4',
    name: 'Phoenix GO 4 gas fusion machine',
    brand: 'XRF SCIENTIFIC',
    brandId: 'xrf-scientific',
    typeId: 'instrument',
    applicationIds: ['lab-research', 'mining'],
    image: '/images/products/phoenix-go-4.png',
    category: 'Fusion equipment',
    application: 'XRF analysis',
    shortDescription:
      'Robust four-position gas fusion machine engineered for demanding industrial conditions.',
  },
  {
    id: 'xrfuse-front',
    slug: 'xrfuse-front',
    name: 'xrFuse automated electric fusion system',
    brand: 'XRF SCIENTIFIC',
    brandId: 'xrf-scientific',
    typeId: 'instrument',
    applicationIds: ['lab-research', 'mining'],
    image: '/images/products/xrfuse-6.png',
    category: 'Fusion equipment',
    application: 'Sample preparation',
    shortDescription:
      'Automated electric fusion machine engineered for sample preparation and consistent analytical results.',
  },
  {
    id: 'phoenix-go-4-banner',
    slug: 'phoenix-go-4-banner',
    name: 'Phoenix GO 4 gas fusion workstation',
    brand: 'XRF SCIENTIFIC',
    brandId: 'xrf-scientific',
    typeId: 'instrument',
    applicationIds: ['lab-research', 'mining'],
    image: '/images/products/phoenix-go-4.png',
    category: 'Fusion equipment',
    application: 'Sample preparation',
    shortDescription:
      'High-performance gas fusion workstation providing consistent thermal control.',
  },
]

const dummyImages = [
  '/images/products/xrfuse-2.png',
  '/images/products/xrfuse-6.png',
  '/images/products/phoenix-go-4.png',
]

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Dummy catalog until Woo Store API lands.
const dummyModels: Array<{
  brand: string
  brandId: string
  typeId: string
  applicationIds: string[]
  category: string
  names: string[]
}> = [
  {
    brand: 'XRF SCIENTIFIC',
    brandId: 'xrf-scientific',
    typeId: 'instrument',
    applicationIds: ['lab-research', 'mining'],
    category: 'Fusion equipment',
    names: [
      'xrFuse 2 electric fusion furnace',
      'xStream 2 benchtop pellet press',
      'xPrep automated borate fluxer',
    ],
  },
  {
    brand: 'OREAS',
    brandId: 'oreas',
    typeId: 'consumables',
    applicationIds: ['mining'],
    category: 'Reference materials',
    names: [
      'OREAS 501b gold reference material',
      'OREAS 503d copper concentrate standard',
      'OREAS 520 iron ore reference',
      'OREAS 621 lithium ore standard',
      'OREAS 701 base metal reference',
    ],
  },
  {
    brand: 'Brammer Standard',
    brandId: 'brammer-standard',
    typeId: 'consumables',
    applicationIds: ['lab-research', 'mining'],
    category: 'Reference materials',
    names: [
      'Brammer BS 181 carbon steel standard',
      'Brammer BS 592 stainless steel reference',
      'Brammer BS 36A cast iron chip',
      'Brammer BS 102 aluminium alloy disc',
      'Brammer BS 77E nickel alloy standard',
    ],
  },
  {
    brand: 'Kingyosion',
    brandId: 'kingyosion',
    typeId: 'analytical',
    applicationIds: ['mining'],
    category: 'Spectrometers',
    names: [
      'King Yosion KY-6800 XRF spectrometer',
      'King Yosion KY-8200 elemental analyzer',
      'King Yosion KY-3600 sample press',
      'King Yosion KY-1200 fusion bead machine',
      'King Yosion KY-9500 grinding mill',
    ],
  },
  {
    brand: 'Mettler Toledo',
    brandId: 'mettler-toledo',
    typeId: 'analytical',
    applicationIds: ['lab-research'],
    category: 'Balances',
    names: [
      'Mettler Toledo XPR205 analytical balance',
      'Mettler Toledo MS304TS precision balance',
      'Mettler Toledo TGA/DSC 3+ analyzer',
      'Mettler Toledo SevenExcellence pH meter',
      'Mettler Toledo DM40 density meter',
    ],
  },
  {
    brand: 'Specac',
    brandId: 'specac',
    typeId: 'instrument',
    applicationIds: ['lab-research'],
    category: 'Sample preparation',
    names: [
      'Specac Atlas manual hydraulic press',
      'Specac Quest ATR accessory',
      'Specac Pearl liquid transmission cell',
      'Specac GS10802 pellet die set',
    ],
  },
]

const dummyProducts: ProductCardData[] = dummyModels.flatMap(
  ({ brand, brandId, typeId, applicationIds, category, names }, brandIndex) =>
    names.map((name, nameIndex) => ({
      id: `dummy-${slugify(brand)}-${nameIndex}`,
      slug: `dummy-${slugify(brand)}-${nameIndex}`,
      name,
      brand,
      brandId,
      typeId,
      applicationIds,
      image: dummyImages[(brandIndex * 2 + nameIndex) % dummyImages.length],
      category,
    })),
)

export const allProducts: ProductCardData[] = [
  ...mockProducts,
  ...dummyProducts,
]

export const featuredProducts: ProductCardData[] = mockProducts

const xrfuse2Detail: ProductDetailData = {
  ...mockProducts[0],
  heroImage: '/images/products/xrfuse-2.png',
  brandLogo: '/images/about-us/our-partner-logo/xrf-scientific.png',
  tags: ['Electric fusion machines', 'Fusion equipment', 'XRF scientific'],
  description: [
    'The xrFuse automatic electric fusion range builds on more than 25 years of fusion technology and application experience. xrFuse 2 is designed around the needs of its users.',
    "Its thermal-imaging technology has been tested by customers in some of the world's largest XRF laboratories.",
  ],
  benefits: [
    {
      title: 'Contamination-free preparation',
      description:
        'High-purity ceramic holders and mould supports help keep the fusion environment free of contamination from these components.',
    },
    {
      title: 'Flexible processes',
      description:
        'Pre-heating and ICP preparation are accessible, controllable, and monitored from the touchscreen.',
    },
    {
      title: 'Straightforward controls',
      description:
        'A simple touchscreen accommodates routine operation and more complex experiments.',
    },
    {
      title: 'Safe operation',
      description:
        'The external surfaces are designed to remain safe to touch. The machine is CE-certified and independently tested.',
    },
  ],
  specifications: [
    { label: 'Fusion positions', value: '2 positions' },
    { label: 'Heating method', value: 'Automatic electric fusion' },
    { label: 'Control interface', value: 'Integrated touchscreen' },
    { label: 'Applications', value: 'XRF and ICP sample preparation' },
  ],
  relatedProductSlugs: [
    'xrfuse-6',
    'phoenix-go-4',
    'xrfuse-front',
    'phoenix-go-4-banner',
  ],
}

function toCatalogDetail(product: ProductCardData): ProductDetailData {
  const category = product.category ?? 'laboratory equipment'

  return {
    ...product,
    heroImage: product.image,
    tags: [category, product.application ?? 'Analytical solutions'],
    description: [
      `${product.name} is part of the ${product.brand} product range.`,
      product.shortDescription ??
        'Product information will be expanded when the catalog is connected to WooCommerce.',
    ],
    benefits: [],
    specifications: [
      { label: 'Brand', value: product.brand },
      { label: 'Category', value: category },
    ],
    relatedProductSlugs: allProducts
      .filter((item) => item.slug !== product.slug)
      .slice(0, 4)
      .map((item) => item.slug),
  }
}

export function getProductDetail(slug: string): ProductDetailData | undefined {
  const product = allProducts.find((item) => item.slug === slug)
  if (!product) return undefined

  return product.slug === xrfuse2Detail.slug
    ? xrfuse2Detail
    : toCatalogDetail(product)
}
