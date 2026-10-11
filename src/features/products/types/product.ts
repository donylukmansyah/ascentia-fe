// Frontend product model: Woo Store API + WP ACF fields.
export interface ProductCardData {
  id: string
  slug: string
  name: string
  brand: string
  image?: string | null
  category?: string
  application?: string
  shortDescription?: string
}
