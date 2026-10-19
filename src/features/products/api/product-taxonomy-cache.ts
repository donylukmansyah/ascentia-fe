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
        .catch((error: unknown) => {
          // Serve stale taxonomy when backend fetch fails.
          if (cached) return cached.data
          throw error
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

export { createKeyedCache } from '#/lib/cache.ts'
