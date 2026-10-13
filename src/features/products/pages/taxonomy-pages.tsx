import { productApplications, productTypes } from '../constants/brands'
import { allProducts, featuredProducts } from '../constants/products'
import { ProductListingPage } from './product-listing-page'

export function TypesPage() {
  return (
    <ProductListingPage
      products={allProducts}
      recommendations={featuredProducts}
      options={productTypes}
      field="typeId"
      title="Types"
      label="type"
    />
  )
}

export function ApplicationsPage() {
  return (
    <ProductListingPage
      products={allProducts}
      recommendations={featuredProducts}
      options={productApplications}
      field="applicationIds"
      title="Applications"
      label="application"
    />
  )
}
