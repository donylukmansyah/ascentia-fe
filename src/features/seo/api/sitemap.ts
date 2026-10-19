import { PROD_SITE_URL } from '../../../lib/seo.ts'

export function sitemapXml(entries: { path: string; modified?: string }[]) {
  const unique = new Map(entries.map((entry) => [entry.path, entry]))
  if (unique.size > 50_000) throw new Error('Sitemap limit exceeded')
  const escape = (value: string) =>
    value.replace(
      /[<>&"']/g,
      (character) =>
        ({
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          '"': '&quot;',
          "'": '&apos;',
        })[character]!,
    )
  const urls = [...unique.values()].map(({ path, modified }) => {
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('#')) {
      throw new Error('Invalid sitemap path')
    }
    const url = new URL(path, PROD_SITE_URL)
    if (url.origin !== PROD_SITE_URL) throw new Error('Invalid sitemap origin')
    const timestamp =
      modified && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z?$/.test(modified)
        ? `${modified.replace(/Z$/, '')}Z`
        : undefined
    return `<url><loc>${escape(url.href)}</loc>${timestamp && Number.isFinite(Date.parse(timestamp)) ? `<lastmod>${timestamp}</lastmod>` : ''}</url>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`
}
