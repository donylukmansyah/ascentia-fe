import { SITE_URL } from '../../../lib/seo.ts'

const BOT_PATTERN =
  /bot|crawl|spider|slurp|archiver|facebookexternalhit|whatsapp|telegram|slack|discord|preview|monitor|uptime|pingdom|lighthouse|headless|python-requests|curl|wget|go-http-client/i

const RATE_LIMIT = 120
const RATE_WINDOW_MS = 60_000

export interface RateLimiter {
  allow: (key: string, now?: number) => boolean
}

export function createRateLimiter(
  limit = RATE_LIMIT,
  windowMs = RATE_WINDOW_MS,
): RateLimiter {
  const buckets = new Map<string, number[]>()
  return {
    allow(key, now = Date.now()) {
      const recent = (buckets.get(key) ?? []).filter(
        (timestamp) => now - timestamp < windowMs,
      )
      if (recent.length >= limit) {
        buckets.set(key, recent)
        return false
      }
      recent.push(now)
      buckets.set(key, recent)
      if (buckets.size > 5_000) {
        for (const [bucketKey, timestamps] of buckets) {
          if (!timestamps.some((timestamp) => now - timestamp < windowMs)) {
            buckets.delete(bucketKey)
          }
        }
      }
      return true
    },
  }
}

const pageViewLimiter = createRateLimiter()

export function isBotRequest(request: Request): boolean {
  const userAgent = request.headers.get('user-agent')?.trim()
  if (!userAgent) return true
  return BOT_PATTERN.test(userAgent)
}

function toOrigin(value: string | null): string | null {
  if (!value) return null
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function isSameSiteRequest(request: Request): boolean {
  const source =
    toOrigin(request.headers.get('origin')) ??
    toOrigin(request.headers.get('referer'))
  if (!source) {
    return request.headers.get('sec-fetch-site') === 'same-origin'
  }
  if (source === new URL(request.url).origin) return true
  const forwardedHost = request.headers
    .get('x-forwarded-host')
    ?.split(',')[0]
    ?.trim()
  const host = forwardedHost || request.headers.get('host')
  if (host) {
    if (source === `https://${host}` || source === `http://${host}`) return true
  }
  return source === SITE_URL || source === 'https://www.ascentia.co.id'
}

function clientKey(request: Request): string | null {
  const forwarded = request.headers
    .get('x-forwarded-for')
    ?.split(',')[0]
    ?.trim()
  return (
    forwarded ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip')
  )
}

export function shouldCountPageView(
  request: Request,
  limiter: RateLimiter = pageViewLimiter,
  now = Date.now(),
): boolean {
  if (isBotRequest(request) || !isSameSiteRequest(request)) return false
  const key = clientKey(request)
  return key ? limiter.allow(key, now) : true
}
