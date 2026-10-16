import assert from 'node:assert/strict'

import {
  mapProduct,
  mapProductImages,
  mapTaxonomies,
  paginationTotals,
  sanitizeProductHtml,
} from './product-mapper.ts'
import { validateListInput } from './product-input.ts'

const terms = [
  { id: 102, slug: 'brands', name: 'Brands', parent: 0, count: 2 },
  { id: 103, slug: 'types', name: 'Types', parent: 0, count: 2 },
  { id: 104, slug: 'applications', name: 'Applications', parent: 0, count: 2 },
  { id: 105, slug: 'xrf', name: 'XRF', parent: 102, count: 2 },
  { id: 106, slug: 'new-brand', name: 'New brand', parent: 102, count: 0 },
  { id: 112, slug: 'instrument', name: 'Instrument', parent: 103, count: 1 },
  { id: 114, slug: 'consumables', name: 'Consumables', parent: 103, count: 1 },
  { id: 115, slug: 'lab', name: 'Lab', parent: 104, count: 1 },
  { id: 116, slug: 'mining', name: 'Mining', parent: 104, count: 1 },
]
const groups = mapTaxonomies(terms)
assert.equal(groups.brands.length, 2)
assert.equal(groups.brands[1].count, 0)
const product = mapProduct(
  {
    id: 1,
    name: 'Fusion machine',
    permalink: 'https://example.com/product/fusion-machine/',
    images: [],
    categories: [105, 112, 114, 115, 116].map((id) => ({ id })),
  },
  groups,
)
assert.equal(product.slug, 'fusion-machine')
assert.deepEqual(product.typeIds, ['112', '114'])
assert.deepEqual(product.applicationIds, ['115', '116'])
const image = {
  id: 10,
  src: 'https://example.com/main.png',
  thumbnail: 'https://example.com/main-small.png',
  srcset: 'https://example.com/main.png 600w',
  alt: 'Front view',
}
const images = mapProductImages([
  image,
  { ...image, alt: 'Duplicate' },
  { id: 11, src: 'javascript:alert(1)' },
  null,
  { id: 'invalid', src: 'https://example.com/invalid.png' },
  {
    id: 12,
    src: 'https://example.com/back.png',
    thumbnail: 'data:image/png;base64,bad',
    srcset: 'javascript:alert(1) 600w',
    alt: '',
  },
  { id: 13, src: 'https://user:password@example.com/private.png' },
])
assert.deepEqual(images, [
  {
    id: '10',
    src: image.src,
    thumbnail: image.thumbnail,
    srcSet: image.srcset,
    alt: 'Front view',
  },
  {
    id: '12',
    src: 'https://example.com/back.png',
    thumbnail: 'https://example.com/back.png',
    srcSet: undefined,
    alt: '',
  },
])
assert.deepEqual(mapProductImages([]), [])
assert.throws(() => mapProductImages({}))
assert.equal(mapProductImages([image]).length, 1)
assert.equal(
  mapProductImages([10, 11, 12, 13, 14].map((id) => ({ ...image, id }))).length,
  5,
)
const card = mapProduct(
  {
    id: 1,
    name: 'Fusion machine',
    permalink: 'https://example.com/product/fusion-machine/',
    images: [image, { ...image, id: 12 }],
    categories: [],
  },
  groups,
)
assert.equal(card.image, image.src)
assert.equal(card.imageSrcSet, image.srcset)
assert.equal(card.imageAlt, image.alt)
assert(!('images' in card))
assert.throws(() => mapProduct({ id: 1 }, groups))
assert.throws(() => mapTaxonomies([{ id: 'broken' }]))
assert.deepEqual(mapTaxonomies([]), { brands: [], types: [], applications: [] })
assert.deepEqual(
  paginationTotals(new Headers({ 'X-WP-Total': '9', 'X-WP-TotalPages': '2' })),
  { total: 9, totalPages: 2 },
)
assert.throws(() => paginationTotals(new Headers()))
assert.throws(() => validateListInput({ page: -1 }))
assert.throws(() => validateListInput({ perPage: 101 }))
assert.throws(() => validateListInput({ group: 'unknown' }))
assert.throws(() => validateListInput({ group: ['brands'] }))
assert.throws(() => validateListInput({ group: { toString: () => 'brands' } }))
assert.deepEqual(
  validateListInput({}),
  validateListInput({ page: 1, perPage: 8, category: '', search: '  ' }),
)
assert.deepEqual(
  validateListInput({ search: ' xrf ' }),
  validateListInput({ search: 'xrf', page: 1, perPage: 8 }),
)
assert.throws(() =>
  paginationTotals(
    new Headers({ 'X-WP-Total': '9007199254740992', 'X-WP-TotalPages': '1' }),
  ),
)
assert.equal(validateListInput({ search: '  xrf  ' }).search, 'xrf')
const safe = sanitizeProductHtml(
  '<h3 style="color:red">Features</h3><ul><li>Safe</li></ul><a href="javascript:alert(1)" onclick="alert(1)">Bad</a><script>alert(1)</script><a href="https://ascentia.co.id/product-category/by-manufacturer/xrf/">Brand</a>',
  groups,
)
assert(safe.includes('<h3>Features</h3>'))
assert(safe.includes('<ul><li>Safe</li></ul>'))
assert(safe.includes('href="/products/brands?category=xrf"'))
assert(!/javascript:|onclick|<script|style=/.test(safe))
for (const empty of [
  null,
  false,
  '',
  '<p><br /></p>',
  '<p>&nbsp; &#160;\u200b</p>',
]) {
  assert.equal(sanitizeProductHtml(empty, groups), '')
}
assert.equal(
  sanitizeProductHtml('<p>Applications</p><script>alert(1)</script>', groups),
  '<p>Applications</p>',
)
assert(
  sanitizeProductHtml(
    '<img src="https://example.com/application.png" />',
    groups,
  ),
)
assert.equal(
  sanitizeProductHtml('<img src="javascript:alert(1)" />', groups),
  '',
)
console.log(
  'PASS: product images, mapping, categories, input, totals, rich HTML sanitization',
)
