import assert from 'node:assert/strict'

import {
  createSeoMeta,
  DEFAULT_OG_IMAGE,
  DEFAULT_SITE_URL,
  toAbsoluteUrl,
  listingPath,
} from './seo.ts'

// toAbsoluteUrl handling
assert.equal(toAbsoluteUrl(''), DEFAULT_OG_IMAGE)
assert.equal(toAbsoluteUrl(null), DEFAULT_OG_IMAGE)
assert.equal(toAbsoluteUrl('/about-us'), `${DEFAULT_SITE_URL}/about-us`)
assert.equal(toAbsoluteUrl('contact-us'), `${DEFAULT_SITE_URL}/contact-us`)
assert.equal(
  toAbsoluteUrl('https://custom.com/image.png'),
  'https://custom.com/image.png',
)

// createSeoMeta root defaults (no path)
const defaults = createSeoMeta()
const meta = defaults.meta
assert.ok(meta.some((m) => 'property' in m && m.property === 'og:site_name'))
assert.ok(meta.some((m) => 'property' in m && m.property === 'og:image'))
assert.equal(defaults.links.length, 0)

// createSeoMeta page overrides (with path)
const custom = createSeoMeta({
  title: 'Custom Title',
  description: 'Custom Description',
  path: '/blogs/hello-world',
  image: '/images/test.png',
  type: 'article',
})
const customMeta = custom.meta
const findMeta = (key: string, val: string) =>
  customMeta.find((m) => key in m && m[key as keyof typeof m] === val)

assert.equal(findMeta('title', 'Custom Title')?.title, 'Custom Title')
assert.equal(findMeta('name', 'description')?.content, 'Custom Description')
assert.equal(findMeta('property', 'og:type')?.content, 'article')
assert.equal(
  findMeta('property', 'og:url')?.content,
  `${DEFAULT_SITE_URL}/blogs/hello-world`,
)
assert.equal(
  findMeta('name', 'twitter:url')?.content,
  `${DEFAULT_SITE_URL}/blogs/hello-world`,
)
assert.equal(
  findMeta('property', 'og:image')?.content,
  `${DEFAULT_SITE_URL}/images/test.png`,
)
assert.equal(custom.links[0]?.href, `${DEFAULT_SITE_URL}/blogs/hello-world`)

assert.equal(
  listingPath('/products/brands', { category: 'xrf', q: '', page: 2 }),
  '/products/brands?category=xrf&page=2',
)
assert.equal(
  listingPath('/products/brands', { category: '', q: '', page: 1 }),
  '/products/brands',
)
assert.ok(!customMeta.some((item) => item.property === 'og:image:width'))
const editorial = createSeoMeta({
  title: 'Fallback',
  path: '/products/example',
  seo: { title: 'Editor title', robots: 'noindex, follow' },
  schema: [{ '@type': 'Product', name: '</script><script>alert(1)</script>' }],
})
assert.equal(editorial.meta[0].title, 'Editor title')
assert.equal(
  editorial.meta.find((item) => item.name === 'robots')?.content,
  'noindex, follow',
)
assert.ok(!editorial.scripts[0].children.includes('</script>'))
assert.equal(
  JSON.parse(editorial.scripts[0].children).name,
  '</script><script>alert(1)</script>',
)

console.log('PASS: seo helpers and meta generation')
