import assert from 'node:assert/strict'
import { sanitizeProductHtml } from '../../src/features/products/api/product-mapper.ts'

// Bounded local repro; never sent to a web server.
assert.doesNotThrow(
  () =>
    sanitizeProductHtml('<iframe>'.repeat(2000), {
      brands: [],
      types: [],
      applications: [],
    }),
  'Sanitizer must reject malformed CMS HTML without stack overflow',
)
console.log('PASS: malformed CMS HTML cannot overflow sanitizer stack')
