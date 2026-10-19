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
        .catch((error: unknown) => {
          // Serve stale cache when backend fetch fails.
          if (existing) return existing.data
          throw error
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
