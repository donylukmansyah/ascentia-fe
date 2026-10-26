// WordPress category slugs; stable across installs (IDs are not).
export const ARTICLE_CATEGORY_SLUGS = {
  news: 'news',
  blogs: 'blogs',
  featuredEvents: 'featured-events',
  recommended: 'recommended-news',
} as const

// Stable slug for blog routing; immune to ID drift.
export const BLOG_CATEGORY_SLUG = ARTICLE_CATEGORY_SLUGS.blogs
