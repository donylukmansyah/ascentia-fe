import assert from 'node:assert/strict'

import { mapArticle, mapSearchArticle } from '../articles/api/article-mapper.ts'
import { validateSearchInput } from './api/search-input.ts'
import { isMacPlatform, isSearchShortcut } from './search-shortcut.ts'

assert.deepEqual(validateSearchInput({ query: '  xrf  ', group: 'products' }), {
  query: 'xrf',
  group: 'products',
})
for (const input of [
  null,
  [],
  { query: 3, group: 'news' },
  { query: 'a', group: 'news' },
  { query: 'x'.repeat(201), group: 'blogs' },
  { query: 'xrf', group: 'admin' },
]) {
  assert.throws(() => validateSearchInput(input))
}
assert.equal(
  validateSearchInput({ query: 'x'.repeat(200), group: 'blogs' }).query.length,
  200,
)
assert.equal(isMacPlatform('MacIntel'), true)
assert.equal(isMacPlatform('Win32'), false)
assert.equal(isMacPlatform('Linux x86_64'), false)
const ctrl = {
  key: 'k',
  ctrlKey: true,
  metaKey: false,
  altKey: false,
  shiftKey: false,
  repeat: false,
  isComposing: false,
}
assert.equal(isSearchShortcut(ctrl, false, false), true)
assert.equal(isSearchShortcut(ctrl, true, false), false)
assert.equal(
  isSearchShortcut({ ...ctrl, ctrlKey: false, metaKey: true }, true, false),
  true,
)
assert.equal(isSearchShortcut(ctrl, false, true), false)
for (const modifier of ['altKey', 'shiftKey', 'repeat', 'isComposing']) {
  assert.equal(
    isSearchShortcut({ ...ctrl, [modifier]: true }, false, false),
    false,
  )
}
const article = {
  id: 1,
  slug: 'example',
  title: { rendered: 'Example' },
  excerpt: { rendered: '' },
  _embedded: {
    'wp:featuredmedia': [
      {
        source_url: 'https://example.com/full.jpg',
        media_details: {
          sizes: {
            large: { source_url: 'https://example.com/large.jpg' },
            thumbnail: { source_url: 'https://example.com/thumb.jpg' },
          },
        },
      },
    ],
  },
}
assert.equal(mapArticle(article).image, 'https://example.com/large.jpg')
assert.equal(mapSearchArticle(article).image, 'https://example.com/thumb.jpg')
console.log('Global search validation, shortcut and thumbnail checks passed')
