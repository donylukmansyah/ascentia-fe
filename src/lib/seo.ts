// ponytail: dev uses localhost/client origin for local previews; prod uses ascentia.co.id
export const PROD_SITE_URL = 'https://ascentia.co.id'
export const SITE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : typeof import.meta.env !== 'undefined' && import.meta.env.DEV
      ? 'http://localhost:3000'
      : PROD_SITE_URL
export const DEFAULT_SITE_URL = SITE_URL
export const DEFAULT_OG_IMAGE = `${SITE_URL}/brand/og-default.png`

export interface SeoInput {
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
  title = 'Ascentia | Scientific Solutions',
  description = 'Analytical instruments, certified reference materials, and technical support for laboratories and industry.',
  path,
  image,
  imageAlt = 'Ascentia Arsya Analitika',
  type = 'website',
}: SeoInput = {}) {
  const url = path !== undefined ? toAbsoluteUrl(path, SITE_URL) : undefined
  const imageUrl = image ? toAbsoluteUrl(image) : DEFAULT_OG_IMAGE

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:site_name', content: 'Ascentia Arsya Analitika' },
      { property: 'og:type', content: type },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      ...(url
        ? [
            { property: 'og:url', content: url },
            { name: 'twitter:url', content: url },
          ]
        : []),
      { property: 'og:image', content: imageUrl },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:alt', content: imageAlt },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
    ],
    links: url ? [{ rel: 'canonical', href: url }] : [],
  }
}
