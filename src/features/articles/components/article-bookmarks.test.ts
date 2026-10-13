import assert from 'node:assert/strict'

import { parseArticleBookmarks } from './article-bookmarks.ts'

for (const value of [null, '', '{', 'null', '{}', 'true', '42', '"article"']) {
  assert.deepEqual(parseArticleBookmarks(value), [])
}
assert.deepEqual(parseArticleBookmarks('[]'), [])
assert.deepEqual(
  parseArticleBookmarks(
    '["matrix-matching",null,2,{},false,"","  ","matrix-matching","mining-samples"]',
  ),
  ['matrix-matching', 'mining-samples'],
)
assert.deepEqual(parseArticleBookmarks('["__proto__","constructor"]'), [
  '__proto__',
  'constructor',
])
