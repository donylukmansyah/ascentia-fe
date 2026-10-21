import assert from 'node:assert/strict'
import {
  createKeyedCache,
  createTaxonomyCache,
} from './product-taxonomy-cache.ts'

const data = { brands: [], types: [], applications: [] }
let calls = 0
let fail = false
let release: () => void = () => {}
let gate = Promise.resolve()
const read = createTaxonomyCache(async () => {
  calls++
  await gate
  if (fail) throw new Error('upstream failed')
  return data
})
const realNow = Date.now
let now = 0
Date.now = () => now
try {
  assert.equal(await read(), data)
  assert.equal(await read(), data)
  assert.equal(calls, 1)
  now = 300_000
  await Promise.all([read(), read(), read()])
  assert.equal(calls, 2)
  now += 300_000
  fail = true
  assert.equal(await read(), data)
  fail = false
  await read()
  assert.equal(calls, 4)
  now += 300_000
  gate = new Promise<void>((resolve) => {
    release = resolve
  })
  const controller = new AbortController()
  const cancelled = read(controller.signal)
  const other = read()
  controller.abort()
  await assert.rejects(cancelled, { name: 'AbortError' })
  release()
  assert.equal(await other, data)
  assert.equal(calls, 5)

  let keyedCalls = 0
  const keyedRead = createKeyedCache(async (key) => {
    keyedCalls++
    return { item: key }
  }, 60_000)

  const a1 = await keyedRead('a')
  const a2 = await keyedRead('a')
  const b1 = await keyedRead('b')
  assert.deepEqual(a1, { item: 'a' })
  assert.deepEqual(a2, { item: 'a' })
  assert.deepEqual(b1, { item: 'b' })
  assert.equal(keyedCalls, 2)
  now += 60_000
  await keyedRead('a')
  assert.equal(keyedCalls, 3)

  console.log(
    'PASS: taxonomy & keyed TTL, dedup, failure recovery, abort isolation',
  )
} finally {
  Date.now = realNow
}
