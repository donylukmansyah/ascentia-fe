# SEO deployment contract

## Frontend

- Public origin remains `https://ascentia.co.id`.
- `WORDPRESS_URL` is the server-only WordPress origin, e.g. `https://cms.ascentia.co.id`.
- Set `SITE_INDEXABLE=false` on staging: responses get `X-Robots-Tag: noindex, nofollow`.
- Set `SITE_INDEXABLE=true` on production after review; restart the Node process.
- Yoast title/description/social image/robots are mapped into SSR head; canonical and schema URLs come from frontend routes. No raw CMS head injection.
- CMS protection must be host-only. Do not set global WordPress search discouragement or global Yoast noindex and then blindly consume those directives for the public frontend.
- Sitemap `/sitemap.xml` uses published product/post IDs and paginated reads, excludes editorial noindex, deduplicates posts assigned to both groups, caches 60 seconds. `/sitemap_index.xml` permanently redirects to it.
- Blog category ID 20 owns `/blogs/:slug`; news/other editorial details use `/news/:slug`. Alternate paths permanently redirect to prevent duplicate articles.
- Listing category/page canonical URLs are preserved. Search-query pages and unavailable listing pages are noindex. Product/blog pagination provides real hrefs.
- Legacy `/product/:slug/`, known root brand pages, XRF category aliases, `/articles/`, and old sitemap index redirect through the existing server entry.
- Legacy `/wp-content/uploads/...` redirects to the configured CMS origin when different from the frontend origin. Ensure CMS upload paths remain unchanged and accessible; remove query-token assumptions.
- Product structured data omits fabricated offers/prices/reviews. Valid markup does not guarantee Google rich results.

## Required external work before cutover

1. Backup WordPress files/database and hosting routing; test rollback.
2. Select the final CMS database and align `brands`, `types`, `applications` taxonomy roots, ACF REST fields, and approved posts. Current live taxonomy is not the frontend contract.
3. Review all old sitemap/Search Console URLs. The code maps known equivalents only. Nested legacy categories such as Fusion Equipment/Electric Fusion/Gas Fusion/Thermal Analysis require an explicit equivalent in the final taxonomy; do not redirect them all to unrelated brands or home.
4. Preserve privacy/legal pages or approve equivalent replacements; retire obsolete placeholders with real 404/410 where appropriate.
5. Configure HTTPS/domain routing, HTTP-to-HTTPS and www normalization in hosting. Do not change email/MX records.
6. CMS HTML: redirect to equivalent public pages or apply host-only noindex. Keep required API/admin/media accessible. Do not combine crawler disallow with relying on that crawler reading noindex.
7. Test actual production build on staging, then set production `SITE_INDEXABLE=true`, switch routing, verify headers, metadata, redirects/media, submit sitemap in Search Console.
8. Keep redirects at least one year. Monitor real 404/5xx, indexing, canonical selection, clicks/impressions and Core Web Vitals. No Search Console Change of Address to the CMS.

## Verification

```sh
node --experimental-strip-types src/lib/seo.test.ts
node --experimental-strip-types src/lib/seo-content.test.ts
node --experimental-strip-types src/features/seo/api/seo.test.ts
pnpm exec tsc --noEmit -p tsconfig.json
pnpm build
node scripts/verify/verify-seo.mjs
```

The production HTTP smoke test launches its own built Node server and local CMS fixture; it does not alter a running dev server or the real WordPress database. It covers metadata/schema, category/page canonical, pagination hrefs, legacy redirects/media, published/noindex sitemap pagination, and 503 on upstream failure. It is not proof of CMS production configuration, Google indexing, rankings, or hosting compatibility.
