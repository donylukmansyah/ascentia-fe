/**
 * Frontend product model for catalog cards and recommendation rails.
 * Aligns with WooCommerce Store API and WordPress ACF product fields.
 */
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

// Backward-compatibility alias
export type Product = ProductCardData
