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
}
