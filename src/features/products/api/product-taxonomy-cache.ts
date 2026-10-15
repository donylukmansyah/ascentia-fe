import type { ProductTaxonomies } from '../types/product.ts'

export function createTaxonomyCache(load: () => Promise<ProductTaxonomies>) {
  let cached: { data: ProductTaxonomies; expiresAt: number } | undefined
  let pending: Promise<ProductTaxonomies> | undefined

  return async (signal?: AbortSignal): Promise<ProductTaxonomies> => {
    signal?.throwIfAborted()
    if (cached && Date.now() < cached.expiresAt) return cached.data
    if (!pending) {
      // Public cache per process; shared storage for multi-node.
      pending = load()
        .then((data) => {
          cached = { data, expiresAt: Date.now() + 5 * 60_000 }
          return data
        })
        .finally(() => {
          pending = undefined
        })
    }
    if (!signal) return pending
    return new Promise((resolve, reject) => {
      const abort = () => reject(signal.reason)
      signal.addEventListener('abort', abort, { once: true })
      pending!.then(resolve, reject).finally(() => {
        signal.removeEventListener('abort', abort)
      })
    })
  }
}

export function createKeyedCache<T>(
  load: (key: string, signal?: AbortSignal) => Promise<T>,
  ttlMs = 60_000,
  maxEntries = 100,
) {
  const cached = new Map<string, { data: T; expiresAt: number }>()
  const pending = new Map<string, Promise<T>>()

  return async (key: string, signal?: AbortSignal): Promise<T> => {
    signal?.throwIfAborted()
    const now = Date.now()
    const existing = cached.get(key)
    if (existing && now < existing.expiresAt) return existing.data

    let promise = pending.get(key)
    if (!promise) {
      promise = load(key, signal)
        .then((data) => {
          if (cached.size >= maxEntries) {
            const oldest = cached.keys().next().value
            if (oldest !== undefined) cached.delete(oldest)
          }
          cached.set(key, { data, expiresAt: Date.now() + ttlMs })
          return data
        })
        .finally(() => {
          pending.delete(key)
        })
      pending.set(key, promise)
    }

    if (!signal) return promise
    return new Promise<T>((resolve, reject) => {
      const abort = () => reject(signal.reason)
      signal.addEventListener('abort', abort, { once: true })
      promise.then(resolve, reject).finally(() => {
        signal.removeEventListener('abort', abort)
      })
    })
  }
}
