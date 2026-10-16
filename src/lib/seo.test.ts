import assert from 'node:assert/strict'

import {
  createSeoMeta,
  DEFAULT_OG_IMAGE,
  DEFAULT_SITE_URL,
  toAbsoluteUrl,
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
  customMeta.find((m: any) => m[key] === val)

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

console.log('PASS: seo helpers and meta generation')
