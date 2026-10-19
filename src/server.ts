import handler from '@tanstack/react-start/server-entry'
import {
  legacyMediaUrl,
  legacyRedirect,
} from '#/features/seo/api/legacy-redirects'

export default {
  async fetch(...args: Parameters<typeof handler.fetch>) {
    const [request] = args
    const url = new URL(request.url)
    if (request.method === 'GET' || request.method === 'HEAD') {
      const target =
        legacyRedirect(url.pathname, url.search) ||
        legacyMediaUrl(
          url.pathname,
          process.env.WORDPRESS_URL || '',
          url.origin,
        )
      if (target)
        return new Response(null, {
          status: 301,
          headers: { Location: target },
        })
    }
    let response = await handler.fetch(...args)
    if (process.env.SITE_INDEXABLE === 'false') {
      const headers = new Headers(response.headers)
      headers.set('X-Robots-Tag', 'noindex, nofollow')
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }
    const acceptsGzip = request.headers
      .get('accept-encoding')
      ?.split(',')
      .some((part) => {
        const [encoding, ...parameters] = part.trim().toLowerCase().split(';')
        const quality = parameters.find((parameter) =>
          parameter.trim().startsWith('q='),
        )
        return (
          encoding === 'gzip' &&
          (!quality || Number(quality.trim().slice(2)) > 0)
        )
      })
    if (
      request.method !== 'GET' ||
      !acceptsGzip ||
      !response.body ||
      response.headers.has('content-encoding') ||
      !response.headers.get('content-type')?.startsWith('text/html')
    )
      return response

    const headers = new Headers(response.headers)
    headers.set('Content-Encoding', 'gzip')
    headers.delete('Content-Length')
    headers.append('Vary', 'Accept-Encoding')
    return new Response(
      response.body.pipeThrough(new CompressionStream('gzip')),
      {
        status: response.status,
        statusText: response.statusText,
        headers,
      },
    )
  },
}
