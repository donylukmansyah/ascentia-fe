// Frontend product model: Woo Store API + WP ACF fields.
export interface ProductCardData {
  id: string
  slug: string
  name: string
  brand: string
  brandId: string
  typeId: string
  applicationIds: string[]
  image?: string | null
  category?: string
  application?: string
  shortDescription?: string
}

export interface ProductDetailData extends ProductCardData {
  heroImage?: string | null
  brandLogo?: string | null
  tags: string[]
  description: string[]
  benefits: Array<{ title: string; description: string }>
  specifications: Array<{ label: string; value: string }>
  relatedProductSlugs: string[]
}
