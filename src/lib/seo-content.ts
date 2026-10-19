import sanitizeHtml from 'sanitize-html'
import type { SeoMetadata } from './seo.ts'

export function plainText(value: string): string {
  return sanitizeHtml(
    value.replace(/<\/?(?:p|div|li|h[1-6]|br|tr|td|th)\b[^>]*>/gi, ' '),
    {
      allowedTags: [],
      allowedAttributes: {},
    },
  )
    .replace(/&#(x[\da-f]+|\d+);/gi, (entity, code: string) => {
      const point =
        code[0].toLowerCase() === 'x'
          ? Number.parseInt(code.slice(1), 16)
          : Number(code)
      return point > 0 &&
        point <= 0x10ffff &&
        !(point >= 0xd800 && point <= 0xdfff)
        ? String.fromCodePoint(point)
        : entity
    })
    .replace(
      /&(amp|lt|gt|quot|apos|nbsp);/g,
      (_, name: string) =>
        ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[
          name
        ] ?? '',
    )
    .replace(/\s+/g, ' ')
    .trim()
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' ? plainText(value) || undefined : undefined
}

export function mapYoastSeo(value: unknown): SeoMetadata {
  const data = record(value)
  const image = record(
    Array.isArray(data.og_image) ? data.og_image[0] : undefined,
  )
  let imageUrl: string | undefined
  try {
    const url = new URL(String(image.url))
    if (
      ['https:', 'http:'].includes(url.protocol) &&
      !url.username &&
      !url.password
    ) {
      imageUrl = url.href
    }
  } catch {}
  const robots = record(data.robots)
  return {
    title: text(data.title),
    description: text(data.description),
    socialTitle: text(data.og_title),
    socialDescription: text(data.og_description),
    image: imageUrl,
    imageAlt: text(image.alt),
    imageWidth:
      Number.isSafeInteger(image.width) && Number(image.width) > 0
        ? Number(image.width)
        : undefined,
    imageHeight:
      Number.isSafeInteger(image.height) && Number(image.height) > 0
        ? Number(image.height)
        : undefined,
    imageType: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(
      String(image.type),
    )
      ? String(image.type)
      : undefined,
    robots:
      robots.index === 'noindex'
        ? robots.follow === 'nofollow'
          ? 'noindex, nofollow'
          : 'noindex, follow'
        : robots.follow === 'nofollow'
          ? 'index, nofollow'
          : undefined,
  }
}
