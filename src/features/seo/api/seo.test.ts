import assert from 'node:assert/strict'
import { legacyMediaUrl, legacyRedirect } from './legacy-redirects.ts'
import { sitemapXml } from './sitemap.ts'

assert.equal(
  legacyRedirect('/product/xrfuse-2/', '?utm_source=partner'),
  '/products/xrfuse-2?utm_source=partner',
)
assert.equal(legacyRedirect('/product/%2Fexample/', ''), undefined)
assert.equal(legacyRedirect('/product/%00example/', ''), undefined)
assert.equal(legacyRedirect('/product/%invalid/', ''), undefined)
assert.equal(legacyRedirect('/products/hello', ''), undefined)
assert.equal(legacyRedirect('/sitemap_index.xml', ''), '/sitemap.xml')
assert.equal(
  legacyRedirect('/xrf-scientific/', ''),
  '/products/brands?category=xrf-scientific',
)
assert.equal(
  legacyMediaUrl(
    '/wp-content/uploads/test.png',
    'https://cms.ascentia.co.id',
    'https://ascentia.co.id',
  ),
  'https://cms.ascentia.co.id/wp-content/uploads/test.png',
)
assert.equal(
  legacyMediaUrl(
    '/wp-content/uploads/test.png',
    'https://ascentia.co.id',
    'https://ascentia.co.id',
  ),
  undefined,
)
assert.equal(
  legacyMediaUrl(
    '/wp-config.php',
    'https://cms.ascentia.co.id',
    'https://ascentia.co.id',
  ),
  undefined,
)
assert.throws(() =>
  legacyMediaUrl(
    '/wp-content/uploads/test.png',
    'https://user:secret@cms.example.com',
    'https://ascentia.co.id',
  ),
)
const xml = sitemapXml([
  { path: '/products/example', modified: '2026-10-19T01:02:03' },
  { path: '/products/brands?category=xrf&page=2' },
  { path: '/products/example', modified: '2026-10-19T01:02:03' },
])
assert.equal((xml.match(/<url>/g) ?? []).length, 2)
assert.ok(xml.includes('<lastmod>2026-10-19T01:02:03Z</lastmod>'))
assert.ok(
  xml.includes(
    'https://ascentia.co.id/products/brands?category=xrf&amp;page=2',
  ),
)
assert.throws(() => sitemapXml([{ path: '//evil.example.com' }]))
assert.throws(() => sitemapXml([{ path: '/\\evil.example.com' }]))
console.log('PASS: legacy redirects, safe media URLs, sitemap XML')
