import { createKeyedCache } from '#/lib/cache'
import {
  readProductSitemap,
  readTaxonomies,
} from '#/features/products/api/product-source.server'
import { readArticleSitemap } from '#/features/articles/api/article-source.server'
import { sitemapXml } from './sitemap'

const cachedSitemap = createKeyedCache(
  async (_key, signal) => {
    const [products, articles, taxonomy] = await Promise.all([
      readProductSitemap(signal),
      readArticleSitemap(signal),
      readTaxonomies(signal),
    ])
    return sitemapXml([
      ...[
        '/',
        '/about-us',
        '/contact-us',
        '/products/brands',
        '/products/types',
        '/products/applications',
        '/news',
        '/blogs',
      ].map((path) => ({ path })),
      ...products,
      ...articles,
      ...Object.entries(taxonomy).flatMap(([group, terms]) =>
        terms
          .filter((term) => term.count > 0)
          .map((term) => ({
            path: `/products/${group}?category=${encodeURIComponent(term.slug)}`,
          })),
      ),
    ])
  },
  60_000,
  1,
)

export function readSitemap(signal?: AbortSignal) {
  return cachedSitemap('public', signal)
}
