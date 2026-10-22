import assert from 'node:assert/strict'

import { createKeyedCache } from '../../src/lib/cache.ts'
import { submitContact } from '../../src/features/contact/api/contact-source.server.ts'

const results = []
const cached = createKeyedCache(
  (_key, signal) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve('loaded'), 30)
      signal?.addEventListener(
        'abort',
        () => {
          clearTimeout(timer)
          reject(signal.reason)
        },
        { once: true },
      )
    }),
)
const first = new AbortController()
const second = new AbortController()
const requests = [
  cached('shared', first.signal),
  cached('shared', second.signal),
]
first.abort(new Error('First caller cancelled'))
const outcomes = await Promise.allSettled(requests)
results.push({
  check: 'Second cache caller survives first cancellation',
  passed: outcomes[1].status === 'fulfilled' && !second.signal.aborted,
  detail: outcomes.map((outcome) => outcome.status),
})

const originalFetch = globalThis.fetch
const originalOrigin = process.env.WORDPRESS_URL
process.env.WORDPRESS_URL = 'http://127.0.0.1:1'
try {
  globalThis.fetch = async () =>
    Response.json({ success: false, message: 'Not stored' })
  let rejected = false
  try {
    await submitContact({
      name: 'Audit',
      email: 'audit@example.com',
      message: 'Mocked response. No network request.',
    })
  } catch {
    rejected = true
  }
  results.push({
    check: 'Contact rejects HTTP 200 with success false',
    passed: rejected,
  })
  for (const invalid of [
    {},
    { success: true },
    { success: true, message: '' },
    { success: true, message: 'OK', id: -1 },
    { success: true, message: 'OK', id: '1' },
  ]) {
    globalThis.fetch = async () => Response.json(invalid)
    await assert.rejects(
      submitContact({
        name: 'Audit',
        email: 'audit@example.com',
        message: 'Mocked',
      }),
      /invalid confirmation/,
    )
  }
  globalThis.fetch = async () =>
    Response.json({ success: true, message: 'Stored', id: 1 })
  assert.equal(
    (
      await submitContact({
        name: 'Audit',
        email: 'audit@example.com',
        message: 'Mocked',
      })
    ).id,
    1,
  )
  globalThis.fetch = async () =>
    Response.json({ message: 'Unavailable' }, { status: 503 })
  await assert.rejects(
    submitContact({
      name: 'Audit',
      email: 'audit@example.com',
      message: 'Mocked',
    }),
    /Unavailable/,
  )
  results.push({
    check:
      'Malformed acknowledgments rejected; valid acceptance and HTTP errors preserved',
    passed: true,
  })
} finally {
  globalThis.fetch = originalFetch
  if (originalOrigin === undefined) delete process.env.WORDPRESS_URL
  else process.env.WORDPRESS_URL = originalOrigin
}

console.log(JSON.stringify(results, null, 2))
assert.ok(
  results.every((result) => result.passed),
  'Production boundary regression',
)
