import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

export type LocaleCode = 'id' | 'en'

function localeFromPath(pathname: string): LocaleCode {
  return /^\/en(?:[/?#]|$)/.test(pathname) ? 'en' : 'id'
}

// Current locale from the URL; works in SSR and on the client.
export const currentLocale = createIsomorphicFn()
  .server((): LocaleCode => {
    try {
      return localeFromPath(new URL(getRequest().url).pathname)
    } catch {
      return 'id'
    }
  })
  .client((): LocaleCode => localeFromPath(window.location.pathname))
