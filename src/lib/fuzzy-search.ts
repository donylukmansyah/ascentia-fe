import Fuse from 'fuse.js'
import type { IFuseOptions } from 'fuse.js'

export interface FuzzyMatchResult<T> {
  item: T
  score?: number
}

// Search array of objects with Fuse.js
export function fuzzySearch<T>(
  items: T[],
  query: string,
  options: IFuseOptions<T> = {},
): T[] {
  if (!query.trim() || items.length === 0) return items

  const fuse = new Fuse(items, {
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2,
    ...options,
  })

  return fuse.search(query).map((result) => result.item)
}

// Find closest typo match from string list
export function getFuzzySuggestion(
  candidates: string[],
  query: string,
  threshold = 0.45,
): string | null {
  const trimmed = query.trim()
  if (!trimmed || candidates.length === 0) return null

  // If exact match already exists (case-insensitive), no suggestion needed
  const lowerQuery = trimmed.toLowerCase()
  if (candidates.some((c) => c.toLowerCase() === lowerQuery)) {
    return null
  }

  const fuse = new Fuse(candidates, {
    threshold,
    ignoreLocation: true,
    minMatchCharLength: 2,
  })

  const results = fuse.search(trimmed)
  return results.length > 0 ? results[0].item : null
}
