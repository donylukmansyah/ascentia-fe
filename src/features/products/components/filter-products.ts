import type { ProductCardData } from '../types/product.ts'

export type ProductFilterField = 'brandId' | 'typeId' | 'applicationIds'

export function filterProducts(
  products: ProductCardData[],
  field: ProductFilterField,
  activeId: string,
  query: string,
) {
  const keyword = query.trim().toLowerCase()
  return products.filter((product) => {
    const value = product[field]
    if (
      activeId !== 'all' &&
      (Array.isArray(value) ? !value.includes(activeId) : value !== activeId)
    )
      return false
    return [
      product.name,
      product.brand,
      product.category ?? '',
      product.application ?? '',
    ]
      .join(' ')
      .toLowerCase()
      .includes(keyword)
  })
}
