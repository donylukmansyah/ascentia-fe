import { useSyncExternalStore } from 'react'

const storageKey = 'ascentia:article-bookmarks'
let saved: Array<string> = []
let initialized = false
const listeners = new Set<() => void>()

export function parseArticleBookmarks(value: string | null): Array<string> {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]')
    return Array.isArray(parsed)
      ? [
          ...new Set(
            parsed.filter(
              (id): id is string =>
                typeof id === 'string' && id.trim().length > 0,
            ),
          ),
        ]
      : []
  } catch {
    return []
  }
}

function notify() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) {
      saved = parseArticleBookmarks(event.newValue)
      notify()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function useArticleBookmark(id: string) {
  const bookmarked = useSyncExternalStore(
    subscribe,
    () => {
      if (!initialized && typeof window !== 'undefined') {
        initialized = true
        try {
          saved = parseArticleBookmarks(window.localStorage.getItem(storageKey))
        } catch {
          saved = []
        }
      }
      return saved.includes(id)
    },
    () => false,
  )

  const toggle = () => {
    saved = saved.includes(id)
      ? saved.filter((item) => item !== id)
      : [...saved, id]
    notify()
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(saved))
    } catch {
      return
    }
  }

  return { bookmarked, toggle }
}
