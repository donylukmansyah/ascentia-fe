import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { NotFoundPage } from '#/components/layout/not-found-page'
import { SiteFooter } from '#/components/layout/site-footer'
import { SiteHeader } from '#/components/layout/site-header'
import { SocialDock } from '#/components/layout/social-dock/social-dock'
import { createSeoMeta } from '#/lib/seo'
import { GlobalSearch } from '#/features/search/components/global-search'

import appCss from '../styles.css?url'

const defaultSeo = createSeoMeta()

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        ...defaultSeo.meta,
      ],
      links: [
        {
          rel: 'stylesheet',
          href: appCss,
        },
        {
          rel: 'icon',
          href: '/favicon/favicon.ico',
        },
        ...defaultSeo.links,
      ],
    }),
    notFoundComponent: NotFoundPage,
    component: RootLayout,
    shellComponent: RootDocument,
  },
)

function RootLayout() {
  return (
    <>
      <GlobalSearch>
        {({ open, shortcut, onOpen }) => (
          <SiteHeader
            searchOpen={open}
            searchShortcut={shortcut}
            onSearchOpen={onOpen}
          />
        )}
      </GlobalSearch>
      <main>
        <Outlet />
      </main>
      <SiteFooter />
      <SocialDock />
    </>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        {import.meta.env.DEV && (
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  )
}
