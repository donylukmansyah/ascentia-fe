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

import fontUrl from '@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2?url'
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
        ...defaultSeo.meta.filter(
          (item) =>
            !['og:image:width', 'og:image:height', 'og:image:type'].includes(
              item.property ?? '',
            ),
        ),
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
        <link rel="preload" as="style" href={appCss} fetchPriority="high" />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href={fontUrl}
          crossOrigin="anonymous"
        />
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
