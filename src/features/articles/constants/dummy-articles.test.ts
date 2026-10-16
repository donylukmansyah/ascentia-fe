import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'

import {
  dummyArticles,
  dummyNewsSelections,
  getLatestPool,
  latestPageSize,
  selectDummyArticles,
} from './dummy-articles.ts'

assert.equal(
  new Set(dummyArticles.map((article) => article.id)).size,
  dummyArticles.length,
)
assert.equal(
  new Set(dummyArticles.map((article) => article.slug)).size,
  dummyArticles.length,
)

const topIds = [
  ...dummyNewsSelections.featured,
  ...dummyNewsSelections.center,
  ...dummyNewsSelections.right,
]
assert.equal(topIds.length, 9)
assert.equal(new Set(topIds).size, topIds.length)
assert.equal(dummyNewsSelections.latest.length, 4)
assert.equal(dummyNewsSelections.popular.length, 4)

for (const ids of Object.values(dummyNewsSelections)) {
  assert.deepEqual(
    selectDummyArticles(ids).map((article) => article.id),
    ids,
  )
}

for (const article of dummyArticles) {
  assert.ok(article.title && article.excerpt && article.alt && article.slug)
  assert.ok(Number.isFinite(Date.parse(article.date)))
  assert.ok(Number.isInteger(article.readMinutes) && article.readMinutes > 0)
  assert.ok(
    existsSync(new URL(`../../../../public${article.image}`, import.meta.url)),
  )
}

assert.throws(() => selectDummyArticles(['missing']), /Unknown dummy article/)
assert.deepEqual(selectDummyArticles([]), [])

assert.equal(latestPageSize, 4)
const latestPool = getLatestPool()
assert.deepEqual(
  latestPool.slice(0, latestPageSize).map((article) => article.id),
  [...dummyNewsSelections.latest],
)
assert.equal(
  new Set(latestPool.map((article) => article.id)).size,
  latestPool.length,
)
assert.equal(latestPool.length, dummyArticles.length)
