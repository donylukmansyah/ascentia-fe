import assert from 'node:assert/strict'

import { filterProducts } from './filter-products.ts'
import { allProducts } from '../constants/products.ts'
import {
  productApplications,
  productBrands,
  productTypes,
} from '../constants/brands.ts'

assert.equal(filterProducts(allProducts, 'brandId', 'all', '  ').length, 32)

for (const [field, options] of [
  ['brandId', productBrands],
  ['typeId', productTypes],
  ['applicationIds', productApplications],
] as const) {
  for (const option of options) {
    const matches = filterProducts(allProducts, field, option.id, '')
    assert.ok(matches.length > 0)
    assert.ok(
      matches.every((product) => {
        const value = product[field]
        return Array.isArray(value)
          ? value.includes(option.id)
          : value === option.id
      }),
    )
  }
  assert.deepEqual(filterProducts(allProducts, field, 'missing', ''), [])
}

const renamed = { ...allProducts[0], brand: 'Unrelated display name' }
assert.deepEqual(filterProducts([renamed], 'brandId', 'xrf-scientific', ''), [
  renamed,
])
assert.equal(
  filterProducts(allProducts, 'typeId', 'instrument', '  XRFUSE 2  ').length,
  2,
)
assert.equal(
  filterProducts(allProducts, 'typeId', 'consumables', 'xrfuse').length,
  0,
)
assert.equal(
  filterProducts(allProducts, 'brandId', 'oreas', 'REFERENCE MATERIALS').length,
  5,
)
assert.equal(
  filterProducts(allProducts, 'applicationIds', 'all', 'XRF analysis').length,
  3,
)
assert.deepEqual(
  filterProducts(allProducts, 'brandId', 'all', 'no-such-product'),
  [],
)

const shared = allProducts[0]
for (const id of ['lab-research', 'mining']) {
  assert.ok(
    filterProducts(allProducts, 'applicationIds', id, shared.name).includes(
      shared,
    ),
  )
}
assert.equal(filterProducts(allProducts, 'typeId', 'instrument', '').length, 12)
assert.equal(filterProducts(allProducts, 'typeId', 'analytical', '').length, 10)
assert.equal(
  filterProducts(allProducts, 'typeId', 'consumables', '').length,
  10,
)
assert.equal(
  filterProducts(allProducts, 'applicationIds', 'lab-research', '').length,
  22,
)
assert.equal(
  filterProducts(allProducts, 'applicationIds', 'mining', '').length,
  23,
)
