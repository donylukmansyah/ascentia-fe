import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { validateListInput, validateProductSlug, validateRelatedInput } from './product-input'

export const getProductTaxonomies = createServerFn({ method: 'GET' }).handler(async () => {
  const { readTaxonomies } = await import('./product-source.server')
  return readTaxonomies(getRequest().signal)
})

export const getProducts = createServerFn({ method: 'GET' })
  .validator(validateListInput)
  .handler(async ({ data }) => {
    const { readProducts } = await import('./product-source.server')
    return readProducts(data, getRequest().signal)
  })

export const getProduct = createServerFn({ method: 'GET' })
  .validator(validateProductSlug)
  .handler(async ({ data }) => {
    const { readProductDetail } = await import('./product-source.server')
    return readProductDetail(data, getRequest().signal)
  })

export const getRelatedProducts = createServerFn({ method: 'GET' })
  .validator(validateRelatedInput)
  .handler(async ({ data }) => {
    const { readRelatedProducts } = await import('./product-source.server')
    return readRelatedProducts(data, getRequest().signal)
  })
