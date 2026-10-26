// Retry only transient WordPress failures; never during SSR.
export function retryWordPressQuery(failureCount: number, error: Error) {
  if (import.meta.env.SSR || failureCount >= 1) return false
  return (
    ['TimeoutError', 'WordPressNetworkError', 'WordPressHttp429'].includes(
      error.name,
    ) ||
    /^WordPressHttp5\d{2}$/.test(error.name) ||
    /^(WordPress request timed out|WordPress connection failed|WordPress request failed \((429|5\d{2})\))$/.test(
      error.message,
    )
  )
}
