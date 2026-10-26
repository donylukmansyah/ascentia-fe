// WordPress category IDs; update if WP taxonomy changes.
export const ARTICLE_CATEGORY_IDS = {
  news: 19,
  blogs: 96,
  featuredEvents: 94,
  recommended: 95,
} as const

// Stable slug for blog routing; immune to ID drift.
export const BLOG_CATEGORY_SLUG = 'blogs'
