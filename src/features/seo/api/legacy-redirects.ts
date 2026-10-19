const brands: Record<string, string> = {
  '/xrf-scientific': 'xrf-scientific',
  '/brammer-standard': 'brammer-standard',
  '/oreas-2': 'oreas',
  '/fritsch-2': 'fritsch',
}

export function legacyRedirect(pathname: string, search: string) {
  const path = pathname.replace(/\/+$/, '')
  if (path === '/sitemap_index.xml') return '/sitemap.xml'
  if (path === '/articles') return '/blogs'
  if (
    [
      '/product-category/xrf-scientific',
      '/product-category/by-manufacturer/xrf-scientific',
    ].includes(path)
  ) {
    return '/products/brands?category=xrf-scientific'
  }
  if (brands[path]) return `/products/brands?category=${brands[path]}`
  const match = path.match(/^\/product\/([^/]+)$/)
  if (!match) return undefined
  let slug: string
  try {
    slug = decodeURIComponent(match[1])
  } catch {
    return undefined
  }
  if (
    !slug ||
    /[\s/\\]/.test(slug) ||
    [...slug].some((character) => character.charCodeAt(0) < 32)
  )
    return undefined
  return `/products/${encodeURIComponent(slug)}${search}`
}

export function legacyMediaUrl(
  pathname: string,
  cmsOrigin: string,
  requestOrigin: string,
) {
  if (!pathname.startsWith('/wp-content/uploads/') || !cmsOrigin)
    return undefined
  const cms = new URL(cmsOrigin)
  if (
    !['http:', 'https:'].includes(cms.protocol) ||
    cms.username ||
    cms.password
  ) {
    throw new Error('Invalid WordPress configuration')
  }
  if (cms.origin === requestOrigin) return undefined
  const target = new URL(pathname, cms)
  if (
    target.origin !== cms.origin ||
    !target.pathname.startsWith('/wp-content/uploads/')
  )
    return undefined
  return target.href
}
