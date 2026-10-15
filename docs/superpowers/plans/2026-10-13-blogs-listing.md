# Blogs Listing Implementation Plan

> **For agentic workers:** Execute this approved, scoped task inline. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the reference-matched dummy blog cards below the existing hero and reuse Products pagination.

**Architecture:** Blogs consumes the shared Article model with optional author metadata. A controlled pagination component owns navigation controls only; Products and Blogs keep their own data slicing and scroll behavior. The existing detail route resolves blog fixtures as well as news fixtures.

**Tech Stack:** React 19, TanStack Router, Tailwind v4, Base UI Button, lucide-react, Python Playwright.

## Approved Design and Constraints

- Keep the Blogs hero unchanged.
- Heading: `Recent blogs post`.
- Desktop: four columns, three rows, twelve cards per page, four dummy pages.
- Cards: white background, thin light border, small corner radius, 16:9 desk/laptop image, bold title, two-line excerpt, divider, author/date at left, orange clock/reading time at right.
- Reference fixture copy: `Improving Sample Preparation with xrFuse 6`, `A closer look at how automated fusion helps laboratories achieve consistent and reliable results.`, `Mba Eva`, `Nov 2, 2028`, `5 min read`.
- Use `/images/blogs/assets-our-blogs.webp`; author avatar uses the approved `E` fallback.
- Tablet: two columns; narrow mobile: one column. Preserve legibility and keyboard access.
- Pagination: blue active fill; blue outlined page numbers; arrow-only previous/next with disabled bounds. Reuse the existing pagination primitives and Button.
- Public WordPress author embedding currently returns `rest_user_invalid_id`; do not assume author data or avatar always exists. Dummy cards fall back to Ascentia when author is absent.
- No live API, new dependency, CMS credentials, bookmark feature, new detail layout, or unrelated refactor.
- Article-card links reuse the existing editorial preview route; Blogs previews return to Blogs.
- WordPress integration later maps public post fields and optional embeds into Article. Server pagination uses `per_page`, `page`, and `X-WP-TotalPages`, not a full-feed download.

## Task 1: Cards, fixtures, shared pagination

**Files:**

- Modify: `src/components/ui/pagination.tsx`
- Modify: `src/features/products/components/product-grid.tsx`
- Modify: `src/features/articles/types/article.ts`
- Modify: `src/features/articles/constants/dummy-articles.ts`
- Create: `src/features/articles/components/blog-card.tsx`
- Create: `src/features/articles/components/blogs-content-section.tsx`
- Modify: `src/features/articles/pages/blogs-page.tsx`
- Modify: `src/routes/articles.$slug.tsx`
- Modify: `src/features/articles/pages/article-detail-page.tsx`
- Test: `scripts/verify/verify-blogs-listing.py`

**Interfaces:**

- `PagePagination({ page, totalPages, onPageChange, className })` renders shared, controlled page controls; parent owns scrolling and fetching.
- `Article.author?: { name: string; avatarUrl?: string }` is additive; News fixtures remain valid.
- `dummyBlogs: Article[]` contains 48 unique fixture IDs/slugs matching the card reference.
- `BlogCard({ article })` renders the reference-specific card without altering News cards.
- `BlogsContentSection()` slices twelve fixtures per page and scrolls the section into view, respecting reduced motion.
- `ArticleDetailPage({ article, backTo = '/news' })` retains its preview layout; `backTo` also accepts `/blogs`.

- [x] Write the browser check; confirm `/blogs` currently lacks the listing.
- [x] Extract Products pagination controls into `PagePagination`; preserve product state/slicing.
- [x] Add optional author metadata and unique blog fixtures.
- [x] Implement reference cards and responsive listing; compose below the hero.
- [x] Resolve fixture links using the existing article route; preserve News return links.
- [x] Run browser checks for layout, pagination bounds/content changes, keyboard focus, reduced motion, card links, approved initial-avatar fallback, and Products pagination.
- [x] Run existing hero and fixture tests, targeted ESLint/Prettier, typecheck, and build.
- [x] Inspect desktop/mobile screenshots and review the scoped diff.
