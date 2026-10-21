import sanitizeHtml from 'sanitize-html'
import type {
  ProductCardData,
  ProductGroup,
  ProductImage,
  ProductTaxonomies,
} from '../types/product.ts'

const groups: ProductGroup[] = ['brands', 'types', 'applications']

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid CMS response')
  }
  return value as Record<string, unknown>
}

export function text(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Invalid CMS text')
  return value
}

export function positiveId(value: unknown): number {
  if (!Number.isSafeInteger(value) || Number(value) < 1) {
    throw new Error('Invalid CMS ID')
  }
  return Number(value)
}

export function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error('Invalid CMS collection')
  return value
}

export function safeUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : undefined
  } catch {
    return undefined
  }
}

export function mapTaxonomies(value: unknown): ProductTaxonomies {
  const terms = array(value).map((entry) => {
    const term = record(entry)
    const image = term.image ? record(term.image) : undefined
    if (!Number.isSafeInteger(term.parent) || Number(term.parent) < 0) {
      throw new Error('Invalid CMS category parent')
    }
    if (!Number.isSafeInteger(term.count) || Number(term.count) < 0) {
      throw new Error('Invalid CMS category count')
    }
    return {
      id: String(positiveId(term.id)),
      slug: text(term.slug),
      name: text(term.name),
      parent: String(term.parent),
      count: Number(term.count),
      logo: safeUrl(image?.src),
      logoSrcSet: srcSet(image?.srcset),
    }
  })
  const result: ProductTaxonomies = { brands: [], types: [], applications: [] }
  for (const group of groups) {
    const root = terms.find(
      (term) => term.slug === group && term.parent === '0',
    )
    if (!root) continue
    result[group] = terms
      .filter((term) => {
        let parent = term.parent
        const visited = new Set<string>([term.id])
        while (parent !== '0' && !visited.has(parent)) {
          if (parent === root.id) return true
          visited.add(parent)
          parent =
            terms.find((candidate) => candidate.id === parent)?.parent ?? '0'
        }
        return false
      })
      .map(({ parent: _parent, ...term }) => term)
  }
  return result
}

function srcSet(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return undefined
  const entries = value.split(',').map((entry) => entry.trim())
  if (
    !entries.every((entry) => {
      const match = entry.match(/^(https?:\/\/[^\s]+) ([1-9]\d*)w$/)
      return match && safeUrl(match[1])
    })
  )
    return undefined
  return value
}

export function mapProductImages(value: unknown): ProductImage[] {
  const images: ProductImage[] = []
  const seen = new Set<number>()
  for (const entry of array(value)) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue
    const image = record(entry)
    const id = Number(image.id)
    const src = safeUrl(image.src)
    if (!Number.isSafeInteger(image.id) || id < 1 || !src || seen.has(id))
      continue
    seen.add(id)
    images.push({
      id: String(id),
      src,
      thumbnail: safeUrl(image.thumbnail) ?? src,
      srcSet: srcSet(image.srcset),
      alt: typeof image.alt === 'string' ? image.alt.trim() : '',
    })
  }
  return images
}

export function mapProduct(
  value: unknown,
  taxonomy: ProductTaxonomies,
): ProductCardData {
  const product = record(value)
  const categories = new Set(
    array(product.categories).map((entry) =>
      String(positiveId(record(entry).id)),
    ),
  )
  const brand = taxonomy.brands.find((term) => categories.has(term.id))
  const types = taxonomy.types.filter((term) => categories.has(term.id))
  const applications = taxonomy.applications.filter((term) =>
    categories.has(term.id),
  )
  const image = mapProductImages(product.images).at(0)
  const permalink = safeUrl(product.permalink)
  if (!permalink) throw new Error('Invalid product URL')
  const slug = new URL(permalink).pathname.split('/').filter(Boolean).at(-1)
  if (!slug) throw new Error('Missing product slug')
  return {
    id: String(positiveId(product.id)),
    slug: decodeURIComponent(slug),
    name: text(product.name),
    brand: brand?.name ?? 'Product',
    brandId: brand?.id ?? '',
    typeIds: types.map((term) => term.id),
    applicationIds: applications.map((term) => term.id),
    category: types.map((term) => term.name).join(', '),
    application: applications.map((term) => term.name).join(', '),
    image: image?.src,
    imageSrcSet: image?.srcSet,
    imageAlt: image?.alt,
  }
}

export function sanitizeProductHtml(
  value: unknown,
  taxonomy: ProductTaxonomies,
): string {
  if (value == null || value === false) return ''
  const html = text(value)
  const sanitized = sanitizeHtml(html, {
    allowedTags: [
      'p',
      'br',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'strong',
      'b',
      'em',
      'i',
      'ul',
      'ol',
      'li',
      'a',
      'blockquote',
      'table',
      'caption',
      'thead',
      'tbody',
      'tfoot',
      'tr',
      'th',
      'td',
      'dl',
      'dt',
      'dd',
      'img',
    ],
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      th: ['scope', 'colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        let href = attribs.href
        try {
          const url = new URL(href, 'https://ascentia.co.id')
          const match = url.pathname.match(
            /^\/product-category\/(brands|by-manufacturer|types|applications)\/([^/]+)\/?$/,
          )
          if (
            [
              'ascentia.co.id',
              'www.ascentia.co.id',
              'ascentia-local.local',
            ].includes(url.hostname) &&
            match
          ) {
            const group: ProductGroup =
              match[1] === 'by-manufacturer'
                ? 'brands'
                : (match[1] as ProductGroup)
            if (taxonomy[group].some((term) => term.slug === match[2])) {
              href = `/products/${group}?category=${encodeURIComponent(match[2])}`
            }
          }
        } catch {
          href = ''
        }
        return { tagName, attribs: { ...attribs, href } }
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: 'lazy' },
      }),
    },
  }).trim()
  const content = sanitizeHtml(sanitized, {
    allowedTags: [],
    allowedAttributes: {},
  }).replace(/&(?:nbsp|#160|#x0*a0);|[\s\u00a0\u200b\ufeff]/gi, '')
  return content || /<img\b[^>]*\bsrc="https?:\/\/[^"\s]+"/i.test(sanitized)
    ? sanitized
    : ''
}

export function paginationTotals(headers: Headers): {
  total: number
  totalPages: number
} {
  const total = headers.get('X-WP-Total')
  const pages = headers.get('X-WP-TotalPages')
  if (
    total === null ||
    pages === null ||
    !/^\d+$/.test(total) ||
    !/^\d+$/.test(pages)
  ) {
    throw new Error('Missing CMS pagination metadata')
  }
  if (
    !Number.isSafeInteger(Number(total)) ||
    !Number.isSafeInteger(Number(pages))
  ) {
    throw new Error('Invalid CMS pagination metadata')
  }
  return { total: Number(total), totalPages: Number(pages) }
}
