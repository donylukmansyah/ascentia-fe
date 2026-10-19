import assert from 'node:assert/strict'
import { mapYoastSeo, plainText } from './seo-content.ts'

assert.equal(
  plainText('<p>A &amp; B &#8211; sample</p><script>bad()</script>'),
  'A & B – sample',
)
assert.equal(mapYoastSeo(null).title, undefined)
const seo = mapYoastSeo({
  title: 'Product &#8211; Ascentia',
  description: '<b>Editor description</b>',
  canonical: 'https://cms.example.com/product/example/',
  robots: { index: 'noindex' },
  og_image: [{ url: 'javascript:alert(1)', width: -1, height: '630' }],
})
assert.equal(seo.title, 'Product – Ascentia')
assert.equal(seo.description, 'Editor description')
assert.equal(seo.robots, 'noindex, follow')
assert.equal(
  mapYoastSeo({ robots: { index: 'index', follow: 'nofollow' } }).robots,
  'index, nofollow',
)
assert.equal(
  mapYoastSeo({ robots: { index: 'noindex', follow: 'nofollow' } }).robots,
  'noindex, nofollow',
)
assert.equal(seo.image, undefined)
assert.equal(seo.imageWidth, undefined)
assert.ok(!('canonical' in seo))
assert.equal(
  mapYoastSeo({
    og_image: [{ url: 'https://cms.example.com/image.png', width: 292 }],
  }).imageWidth,
  292,
)
assert.equal(plainText('<p>First</p><p>Second</p>'), 'First Second')
console.log('PASS: untrusted Yoast metadata and plain text')
