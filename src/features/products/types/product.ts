export type ProductGroup = 'brands' | 'types' | 'applications'

export interface ProductTaxonomy {
  id: string
  slug: string
  name: string
  logo?: string
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

export interface ProductDetailData extends ProductCardData {
  brandLogo?: string
  descriptionHtml: string
  summaryHtml: string
  specificationsHtml: string
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
