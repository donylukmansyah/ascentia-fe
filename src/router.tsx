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
      input: ({ url }) => {
        const copy = new URL(url.toString())
        if (copy.pathname === '/id') {
          copy.pathname = '/'
          copy.searchParams.set('__locale', 'id')
          return copy
        }
        if (copy.pathname.startsWith('/id/')) {
          copy.pathname = copy.pathname.slice(3)
          copy.searchParams.set('__locale', 'id')
          return copy
        }
        return copy
      },
      output: ({ url }) => {
        const copy = new URL(url.toString())
        const locale = copy.searchParams.get('__locale')
        const isId =
          locale === 'id' ||
          (locale === null &&
            typeof window !== 'undefined' &&
            (window.location.pathname === '/id' ||
              window.location.pathname.startsWith('/id/')))

        if (copy.searchParams.has('__locale')) {
          copy.searchParams.delete('__locale')
        }

        if (isId) {
          if (copy.pathname === '/') {
            copy.pathname = '/id'
          } else if (!copy.pathname.startsWith('/id')) {
            copy.pathname = `/id${copy.pathname}`
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
