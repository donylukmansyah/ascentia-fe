export interface VisitorStatsResult {
  success: boolean
  views: number
}

// Record one page view and return the latest total.
export async function recordPageView(): Promise<VisitorStatsResult> {
  const base =
    process.env.WORDPRESS_URL ||
    (import.meta.env.DEV ? 'http://ascentia-local.local' : '')
  if (!base) return { success: false, views: 0 }

  const origin = new URL(base)
  const url = new URL('/wp-json/ascentia/v1/page-view', origin)
  const headers = new Headers({ Accept: 'application/json' })
  const key = process.env.ASCENTIA_ANALYTICS_KEY
  if (key) headers.set('X-Ascentia-Analytics-Key', key)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(5_000),
    })

    if (!response.ok) {
      return { success: false, views: 0 }
    }

    const payload = (await response.json()) as {
      success?: unknown
      views?: unknown
    }
    const views = payload.views
    if (
      typeof views !== 'number' ||
      !Number.isSafeInteger(views) ||
      views < 0
    ) {
      return { success: false, views: 0 }
    }

    return { success: payload.success !== false, views }
  } catch {
    return { success: false, views: 0 }
  }
}
