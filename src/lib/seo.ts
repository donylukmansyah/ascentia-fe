export const PROD_SITE_URL = 'https://ascentia.co.id'
export const SITE_URL =
  typeof import.meta.env !== 'undefined' && import.meta.env.DEV
    ? 'http://localhost:3000'
    : PROD_SITE_URL
export const DEFAULT_SITE_URL = SITE_URL
export const DEFAULT_OG_IMAGE = `${SITE_URL}/brand/og-default.png`

export interface SeoMetadata {
  title?: string
  description?: string
  socialTitle?: string
  socialDescription?: string
  image?: string
  imageAlt?: string
  imageWidth?: number
  imageHeight?: number
  imageType?: string
  robots?: 'noindex, follow' | 'noindex, nofollow' | 'index, nofollow'
}

export interface SeoInput {
  seo?: SeoMetadata
  robots?: string
  schema?: Record<string, unknown>[]
  title?: string
  description?: string
  path?: string
  image?: string | null
  imageAlt?: string
  type?: 'website' | 'article'
}

export function toAbsoluteUrl(
  pathOrUrl?: string | null,
  fallback = DEFAULT_OG_IMAGE,
): string {
  if (!pathOrUrl) return fallback
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

export function createSeoMeta({
  seo,
  robots,
  schema = [],
  title = 'Ascentia | Scientific Solutions',
  description = 'Analytical instruments, certified reference materials, and technical support for laboratories and industry.',
  path,
  image,
  imageAlt = 'Ascentia Arsya Analitika',
  type = 'website',
}: SeoInput = {}) {
  title = seo?.title || title
  description = seo?.description || description
  image = seo?.image || image
  imageAlt = seo?.imageAlt || imageAlt
  const url = path !== undefined ? toAbsoluteUrl(path, SITE_URL) : undefined
  const imageUrl = image ? toAbsoluteUrl(image) : DEFAULT_OG_IMAGE
  const defaultImage = imageUrl === DEFAULT_OG_IMAGE
  const width = seo?.image ? seo.imageWidth : defaultImage ? 1200 : undefined
  const height = seo?.image ? seo.imageHeight : defaultImage ? 630 : undefined
  const imageType = seo?.image
    ? seo.imageType
    : defaultImage
      ? 'image/png'
      : undefined

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      {
        name: 'robots',
        content:
          robots || seo?.robots || 'index, follow, max-image-preview:large',
      },
      { property: 'og:site_name', content: 'Ascentia Arsya Analitika' },
      { property: 'og:type', content: type },
      { property: 'og:title', content: seo?.socialTitle || title },
      {
        property: 'og:description',
        content: seo?.socialDescription || description,
      },
      ...(url
        ? [
            { property: 'og:url', content: url },
            { name: 'twitter:url', content: url },
          ]
        : []),
      { property: 'og:image', content: imageUrl },
      ...(width
        ? [{ property: 'og:image:width', content: String(width) }]
        : []),
      ...(height
        ? [{ property: 'og:image:height', content: String(height) }]
        : []),
      ...(imageType ? [{ property: 'og:image:type', content: imageType }] : []),
      { property: 'og:image:alt', content: imageAlt },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
    ],
    links: url ? [{ rel: 'canonical', href: url }] : [],
    scripts: schema.map((value) => ({
      type: 'application/ld+json',
      children: JSON.stringify({ '@context': 'https://schema.org', ...value })
        .replace(/</g, '\\u003c')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029'),
    })),
  }
}

export function listingPath(
  path: string,
  search: { category: string; q: string; page: number },
) {
  const params = new URLSearchParams()
  if (search.category) params.set('category', search.category)
  if (search.q) params.set('q', search.q)
  if (search.page > 1) params.set('page', String(search.page))
  return `${path}${params.size ? `?${params}` : ''}`
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path, SITE_URL),
    })),
  }
}
