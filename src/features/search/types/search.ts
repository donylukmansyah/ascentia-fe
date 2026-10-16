export type SearchGroup = 'products' | 'news' | 'blogs'

export interface SearchItem {
  id: string
  title: string
  slug: string
  image?: string | null
  imageSrcSet?: string
  meta: string
  group: SearchGroup
}

export interface SearchInput {
  query: string
  group: SearchGroup
}
