import type { SearchInput } from '../types/search'

export function validateSearchInput(input: unknown): SearchInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid search input')
  }
  const { query, group } = input as Record<string, unknown>
  if (typeof query !== 'string') throw new Error('Invalid search query')
  const trimmed = query.trim()
  if (trimmed.length < 2 || trimmed.length > 200) {
    throw new Error('Search query must contain 2 to 200 characters')
  }
  if (group !== 'products' && group !== 'news' && group !== 'blogs') {
    throw new Error('Invalid search group')
  }
  return { query: trimmed, group }
}
