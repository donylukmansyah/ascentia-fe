import { QueryClient } from '@tanstack/react-query'
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { RouteLoading } from '#/components/layout/route-loading'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, retry: import.meta.env.SSR ? 0 : 1 },
    },
  })
  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: RouteLoading,
    defaultPendingMs: 200,
    defaultPendingMinMs: 200,
    rewrite: {
      // Default locale is id (no prefix); en lives under /en.
      input: ({ url }) => {
        const copy = new URL(url.toString())
        if (copy.pathname === '/en') {
          copy.pathname = '/'
          copy.searchParams.set('__locale', 'en')
          return copy
        }
        if (copy.pathname.startsWith('/en/')) {
          copy.pathname = copy.pathname.slice(3)
          copy.searchParams.set('__locale', 'en')
          return copy
        }
        return copy
      },
      output: ({ url }) => {
        const copy = new URL(url.toString())
        const locale = copy.searchParams.get('__locale')
        const isEn =
          locale === 'en' ||
          (locale === null &&
            typeof window !== 'undefined' &&
            (window.location.pathname === '/en' ||
              window.location.pathname.startsWith('/en/')))

        if (copy.searchParams.has('__locale')) {
          copy.searchParams.delete('__locale')
        }

        if (isEn) {
          if (copy.pathname === '/') {
            copy.pathname = '/en'
          } else if (!copy.pathname.startsWith('/en')) {
            copy.pathname = `/en${copy.pathname}`
          }
          return copy
        }
        return copy
      },
    },
  })

  setupRouterSsrQueryIntegration({ router, queryClient })
  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
