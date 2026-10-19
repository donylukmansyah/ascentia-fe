import type { SeoMetadata } from '#/lib/seo'

export type ProductGroup = 'brands' | 'types' | 'applications'

export interface ProductTaxonomy {
  id: string
  slug: string
  name: string
  logo?: string
  logoSrcSet?: string
  count: number
}

export type ProductTaxonomies = Record<ProductGroup, ProductTaxonomy[]>

export interface ProductCardData {
  id: string
  slug: string
  name: string
  brand: string
  brandId: string
  typeIds: string[]
  applicationIds: string[]
  image?: string | null
  imageSrcSet?: string
  imageAlt?: string
  category?: string
  application?: string
}

export interface ProductImage {
  id: string
  src: string
  thumbnail: string
  srcSet?: string
  alt: string
}

export type ProductDetailTab = 'description' | 'specifications' | 'applications'

export interface ProductDetailSection {
  id: ProductDetailTab
  label: string
}

export interface ProductDetailData extends ProductCardData {
  seo?: SeoMetadata
  images: ProductImage[]
  brandLogo?: string
  descriptionHtml: string
  summaryHtml: string
  specificationsHtml: string
  applicationsHtml: string
  tags: string[]
  publishedAt: string
  modifiedAt: string
}

export interface ProductListInput {
  group?: ProductGroup
  category?: string
  search?: string
  page?: number
  perPage?: number
  featured?: boolean
  excludeId?: string
}

export interface ProductSearch {
  category: string
  q: string
  page: number
}

export interface ProductListResult {
  items: ProductCardData[]
  total: number
  totalPages: number
  page: number
  invalidCategory: boolean
}
