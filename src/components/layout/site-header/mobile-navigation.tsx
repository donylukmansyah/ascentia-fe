import { ChevronDown } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { useLanguage } from '#/lib/i18n'
import { cn } from '#/lib/utils'

import { navigationItems, productBrowseItems } from './navigation-data'

type MobileNavigationProps = {
  isOpen: boolean
  isProductsOpen: boolean
  pathname: string
  onProductsOpenChange: () => void
  onNavigate: () => void
}

export function MobileNavigation({
  isOpen,
  isProductsOpen,
  pathname,
  onProductsOpenChange,
  onNavigate,
}: MobileNavigationProps) {
  const { t } = useLanguage()

  return (
    <nav
      aria-label={t('common.mobileNav', 'Mobile navigation')}
      className="flex h-full flex-col overflow-y-auto px-5 pt-24 pb-10 sm:px-8"
    >
      <ul className="border-t border-foreground/10">
        {navigationItems.map((item, index) => {
          const isActive = pathname === item.href
          const isProducts = item.href === '/products'
          const navLabels: Record<string, string> = {
            '/': t('nav.home', 'Home'),
            '/about-us': t('nav.about', 'About Us'),
            '/products': t('nav.products', 'Products'),
            '/news': t('nav.news', 'News'),
            '/blogs': t('nav.blogs', 'Blogs'),
            '/contact-us': t('nav.contact', 'Contact Us'),
          }
          const navLabel = navLabels[item.href] || item.label

          return (
            <li
              key={item.href}
              className="border-b border-foreground/10"
              style={{
                transitionDelay: isOpen ? `${100 + index * 45}ms` : '0ms',
              }}
            >
              {isProducts ? (
                <>
                  <button
                    type="button"
                    aria-expanded={isProductsOpen}
                    aria-controls="mobile-products-navigation"
                    tabIndex={isOpen ? 0 : -1}
                    onClick={onProductsOpenChange}
                    className={cn(
                      'flex min-h-14 w-full cursor-pointer items-center justify-between py-1 text-left text-base font-semibold transition-[transform,opacity,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 motion-reduce:transition-none',
                      isOpen
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-2 opacity-0',
                      isProductsOpen || isActive
                        ? 'text-primary'
                        : 'text-foreground/75 hover:text-primary',
                    )}
                  >
                    {t('nav.products', 'Products')}
                    <ChevronDown
                      className={cn(
                        'size-4 transition-transform duration-200',
                        isProductsOpen && 'rotate-180',
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  <ul
                    id="mobile-products-navigation"
                    className={cn(
                      'grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out',
                      isProductsOpen
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0',
                    )}
                  >
                    <li
                      className={cn(
                        'min-h-0 space-y-1 transition-[padding] duration-300 ease-out',
                        isProductsOpen ? 'pt-1 pb-3' : 'p-0',
                      )}
                    >
                      {productBrowseItems.map(
                        ({ label, description, href, icon: Icon }) => (
                          <Link
                            key={href}
                            to={href}
                            search={{ category: '', q: '', page: 1 }}
                            tabIndex={isOpen && isProductsOpen ? 0 : -1}
                            onClick={onNavigate}
                            className="flex items-center gap-3 rounded-lg px-2 py-2 text-foreground/75 transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <Icon
                              className="size-5 shrink-0 text-primary"
                              aria-hidden="true"
                            />
                            <span>
                              <span className="block text-sm font-semibold">
                                {t(`ui.${label.toLowerCase()}`)}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {t(
                                  `ui.${label === 'Brands' ? 'brandDescription' : label === 'Types' ? 'typeDescription' : 'applicationDescription'}`,
                                  description,
                                )}
                              </span>
                            </span>
                          </Link>
                        ),
                      )}
                    </li>
                  </ul>
                </>
              ) : (
                <Link
                  to={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  tabIndex={isOpen ? 0 : -1}
                  onClick={onNavigate}
                  className={cn(
                    'flex min-h-14 items-center justify-between py-1 text-base font-semibold transition-[transform,opacity,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 motion-reduce:transition-none',
                    isOpen
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-2 opacity-0',
                    isActive
                      ? 'text-primary'
                      : 'text-foreground/75 hover:text-primary',
                  )}
                >
                  {navLabel}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
