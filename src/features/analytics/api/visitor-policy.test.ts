import assert from 'node:assert/strict'

import {
  createRateLimiter,
  isBotRequest,
  isSameSiteRequest,
  shouldCountPageView,
} from './visitor-policy.ts'

const browserHeaders = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36',
  origin: 'https://ascentia.co.id',
  'x-forwarded-for': '203.0.113.10',
}

const request = (headers: Record<string, string>) =>
  new Request('https://ascentia.co.id/_server', {
    method: 'POST',
    headers,
  })

assert.equal(isBotRequest(request({ 'user-agent': 'Googlebot/2.1' })), true)
assert.equal(
  isBotRequest(request({ 'user-agent': 'Mozilla/5.0 Chrome/140.0' })),
  false,
)
assert.equal(isBotRequest(request({})), true)

assert.equal(isSameSiteRequest(request(browserHeaders)), true)
assert.equal(
  isSameSiteRequest(
    request({ ...browserHeaders, origin: 'https://evil.example' }),
  ),
  false,
)
assert.equal(
  isSameSiteRequest(
    request({
      'user-agent': browserHeaders['user-agent'],
      'sec-fetch-site': 'same-origin',
    }),
  ),
  true,
)
assert.equal(
  isSameSiteRequest(request({ 'user-agent': browserHeaders['user-agent'] })),
  false,
)

assert.equal(
  shouldCountPageView(request(browserHeaders), createRateLimiter(10), 1_000),
  true,
)

const limiter = createRateLimiter(2, 1_000)
assert.equal(limiter.allow('203.0.113.10', 1_000), true)
assert.equal(limiter.allow('203.0.113.10', 1_100), true)
assert.equal(limiter.allow('203.0.113.10', 1_200), false)
assert.equal(limiter.allow('203.0.113.10', 2_100), true)
assert.equal(limiter.allow('203.0.113.11', 2_100), true)

console.log('PASS: page-view policy (bots, origin, rate limit)')
