import sanitizeHtml from 'sanitize-html'

import type {
  Article,
  ArticleCategory,
  ArticleDetailData,
} from '../types/article'

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid CMS response')
  }
  return value as Record<string, unknown>
}

export function array(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error('Invalid CMS collection')
  return value
}

export function text(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
}

export function positiveId(value: unknown): number {
  if (!Number.isSafeInteger(value) || Number(value) < 1) {
    throw new Error('Invalid CMS ID')
  }
  return Number(value)
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&hellip;/g, '...')
    .replace(/\[&hellip;\]/g, '...')
}

export function stripHtmlTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, '').trim())
}

function safeUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}

function calculateReadMinutes(content: string): number {
  const plain = stripHtmlTags(content)
  const words = plain.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export function mapArticle(value: unknown): Article {
  return mapArticleWithImageSize(value, 'large')
}

export function mapSearchArticle(value: unknown): Article {
  return mapArticleWithImageSize(value, 'thumbnail')
}

function mapArticleWithImageSize(value: unknown, imageSize: string): Article {
  const post = record(value)
  const id = String(positiveId(post.id))
  const slug = text(post.slug)
  if (!slug) throw new Error('Missing article slug')

  const titleObj = record(post.title)
  const title = decodeHtmlEntities(text(titleObj.rendered))

  const excerptObj = record(post.excerpt)
  const rawExcerpt = text(excerptObj.rendered)
  const excerpt = stripHtmlTags(rawExcerpt)

  const dateRaw = text(post.date)
  const date = dateRaw.slice(0, 10) || new Date().toISOString().slice(0, 10)

  // Extract featured media from embedded payload.
  const embedded = post._embedded ? record(post._embedded) : undefined
  const featuredList = Array.isArray(embedded?.['wp:featuredmedia'])
    ? (embedded['wp:featuredmedia'] as unknown[])
    : []
  const firstMedia = featuredList.length ? record(featuredList[0]) : undefined
  const mediaDetails = firstMedia?.media_details
    ? record(firstMedia.media_details)
    : undefined
  const sizes = mediaDetails?.sizes ? record(mediaDetails.sizes) : undefined
  const preferredSize = sizes?.[imageSize]
    ? record(sizes[imageSize])
    : undefined
  const largeSize = sizes?.large ? record(sizes.large) : undefined

  const imageUrl =
    safeUrl(preferredSize?.source_url) ||
    safeUrl(largeSize?.source_url) ||
    safeUrl(firstMedia?.source_url) ||
    '/news/news-hero-1.webp'

  const imageAlt = text(firstMedia?.alt_text) || title || 'Ascentia news image'

  // Extract author.
  const authorList = Array.isArray(embedded?.author)
    ? (embedded.author as unknown[])
    : []
  const authorRecord = authorList.length ? record(authorList[0]) : undefined
  const authorName = text(authorRecord?.name) || 'PT Ascentia Arsya Analitika'
  const avatarUrls = authorRecord?.avatar_urls
    ? record(authorRecord.avatar_urls)
    : undefined
  const avatarUrl = safeUrl(avatarUrls?.['96']) || safeUrl(avatarUrls?.['48'])

  // Extract categories.
  const termGroups = Array.isArray(embedded?.['wp:term'])
    ? (embedded['wp:term'] as unknown[])
    : []
  const categoryTerms = Array.isArray(termGroups[0])
    ? (termGroups[0] as unknown[])
    : []
  const categories: ArticleCategory[] = categoryTerms
    .map((term) => {
      try {
        const item = record(term)
        return {
          id: positiveId(item.id),
          name: decodeHtmlEntities(text(item.name)),
          slug: text(item.slug),
        }
      } catch {
        return undefined
      }
    })
    .filter((cat): cat is ArticleCategory => Boolean(cat))

  const rawContent = post.content ? text(record(post.content).rendered) : ''
  const readMinutes = calculateReadMinutes(rawContent || rawExcerpt)

  return {
    id,
    slug,
    title,
    excerpt,
    image: imageUrl,
    alt: imageAlt,
    date,
    readMinutes,
    author: {
      name: authorName,
      avatarUrl,
    },
    categories,
  }
}

export function mapArticleDetail(value: unknown): ArticleDetailData {
  const base = mapArticle(value)
  const post = record(value)
  const rawContent = post.content ? text(record(post.content).rendered) : ''
  const content = sanitizeArticleHtml(rawContent)

  return {
    ...base,
    content,
  }
}

export function sanitizeArticleHtml(html: string): string {
  if (!html) return ''
  return sanitizeHtml(html, {
    allowedTags: [
      'p',
      'br',
      'hr',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'sub',
      'sup',
      'mark',
      'small',
      'span',
      'ul',
      'ol',
      'li',
      'blockquote',
      'pre',
      'code',
      'table',
      'caption',
      'thead',
      'tbody',
      'tfoot',
      'tr',
      'th',
      'td',
      'figure',
      'figcaption',
      'img',
      'picture',
      'source',
      'audio',
      'video',
      'iframe',
      'a',
      'div',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: [
        'src',
        'srcset',
        'sizes',
        'alt',
        'width',
        'height',
        'loading',
        'decoding',
        'class',
      ],
      figure: ['class'],
      figcaption: ['class'],
      audio: ['src', 'controls', 'preload'],
      video: ['src', 'controls', 'preload', 'width', 'height', 'poster'],
      source: ['src', 'srcset', 'type', 'media'],
      iframe: [
        'src',
        'width',
        'height',
        'allow',
        'allowfullscreen',
        'frameborder',
        'title',
        'loading',
      ],
      th: ['scope', 'colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
      code: ['class'],
      span: ['class'],
      p: ['class'],
      div: ['class'],
    },
    allowedIframeHostnames: [
      'www.youtube.com',
      'youtube.com',
      'www.youtube-nocookie.com',
      'player.vimeo.com',
    ],
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
      source: ['http', 'https'],
      audio: ['http', 'https'],
      video: ['http', 'https'],
      iframe: ['https'],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attribs) => {
        const href = attribs.href || ''
        const isExternal =
          /^https?:\/\//i.test(href) &&
          !href.includes('ascentia.co.id') &&
          !href.includes('ascentia-local.local')
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            ...(isExternal
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {}),
          },
        }
      },
    },
  })
}
