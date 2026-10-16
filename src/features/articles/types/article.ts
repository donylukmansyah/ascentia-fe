export interface ArticleCategory {
  id: number
  name: string
  slug: string
}

export interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  image: string
  alt: string
  date: string
  readMinutes: number
  author?: {
    name: string
    avatarUrl?: string
  }
  categories?: ArticleCategory[]
}

export interface ArticleDetailData extends Article {
  content: string
}

export interface NewsListingData {
  featured: Article
  center: Article[]
  right: Article[]
}

export interface LatestNewsData {
  items: Article[]
  page: number
  perPage: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface BlogListingData {
  items: Article[]
  page: number
  perPage: number
  total: number
  totalPages: number
}
