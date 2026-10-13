import { productBrands } from '../constants/brands'
import { allProducts, featuredProducts } from '../constants/products'
import { ProductListingPage } from './product-listing-page'

export function BrandsPage() {
  return (
    <ProductListingPage
      products={allProducts}
      recommendations={featuredProducts}
      options={productBrands}
      field="brandId"
      title="Brands"
      label="brand"
    />
  )
}
