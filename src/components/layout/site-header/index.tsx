import { useEffect, useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'

import { useStickyHeader } from '#/hooks/use-sticky-header'
import { cn } from '#/lib/utils'

import { LanguagePicker } from './language-picker'
import type { LanguageCode } from './language-picker'
import { MobileNavigation } from './mobile-navigation'
import { navigationItems } from './navigation-data'
import { ProductMenu } from './product-menu'

export function SiteHeader() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const mode = useStickyHeader({ hideOffset: 320 })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false)
  const [language, setLanguage] = useState<LanguageCode>('en')
  const isSolid = mode !== 'transparent'
  const isHidden = mode === 'hidden'
  const isHeaderSolid = isSolid || isMenuOpen

  useEffect(() => {
    setIsMenuOpen(false)
    setIsProductsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <header
      className={cn(
        'top-0 inset-x-0 z-50 border-t-[3px] border-primary transform-gpu transition-[background-color,box-shadow,color,translate] motion-reduce:transition-none',
        mode === 'transparent' && !isMenuOpen ? 'absolute' : 'fixed',
        isHeaderSolid
          ? 'bg-background text-foreground shadow-[0_1px_0_rgb(37_37_37/8%),0_12px_32px_-16px_rgb(0_0_0/0.12)]'
          : 'bg-transparent text-white',
        isHidden && !isMenuOpen
          ? 'duration-250 ease-in -translate-y-full'
          : 'duration-500 ease-out translate-y-0',
      )}
    >
      <div className="relative z-10 mx-auto flex h-20 max-w-7xl items-center justify-between gap-8 px-5 sm:px-8 lg:h-24 lg:px-12">
        <Link
          to="/"
          activeOptions={{ exact: true }}
          aria-label="Ascentia home"
          className="shrink-0"
        >
          <img
            src={
              isHeaderSolid ? '/brand/logo-color.png' : '/brand/logo-white.png'
            }
            alt="Ascentia Arsya Analitika"
            className="h-7 w-auto lg:h-7"
            fetchPriority="high"
          />
        </Link>

        <nav aria-label="Primary navigation" className="hidden lg:block">
          <ul className="flex items-center gap-6 xl:gap-7">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href

              if (item.href === '/products') {
                return (
                  <li key={item.href}>
                    <ProductMenu
                      className={
                        isHeaderSolid
                          ? 'text-foreground/75 hover:text-foreground'
                          : 'text-white/80 hover:text-white'
                      }
                    />
                  </li>
                )
              }

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'relative block py-2 text-[11px] font-medium tracking-[-0.01em] uppercase transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[1.5px] after:origin-left after:rounded-full after:bg-primary after:transition-transform hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4',
                      isHeaderSolid
                        ? 'text-foreground/75 hover:text-foreground'
                        : 'text-white/80 hover:text-white',
                      isActive
                        ? cn(
                            'after:scale-x-100',
                            isHeaderSolid ? 'text-foreground' : 'text-white',
                          )
                        : 'after:scale-x-0',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div
          className={cn(
            'hidden items-center gap-3 lg:flex',
            isHeaderSolid ? 'text-foreground/80' : 'text-white/90',
          )}
        >
          <LanguagePicker
            language={language}
            onLanguageChange={setLanguage}
            className={
              isHeaderSolid
                ? 'text-foreground/80 hover:text-foreground'
                : 'text-white/90 hover:text-white'
            }
          />
          <span aria-hidden="true" className="h-5 w-px bg-current opacity-25" />
          <button
            type="button"
            aria-label="Search"
            className={cn(
              'inline-flex cursor-pointer items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4',
              isHeaderSolid ? 'hover:text-foreground' : 'hover:text-white',
            )}
          >
            <Search className="size-[18px]" aria-hidden="true" />
          </button>
        </div>

        <div className="relative z-10 flex items-center gap-1 lg:hidden">
          <button
            type="button"
            aria-label="Search"
            className={cn(
              'inline-flex size-10 cursor-pointer items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4',
              isHeaderSolid
                ? 'text-foreground hover:text-primary'
                : 'text-white hover:text-white/70',
            )}
          >
            <Search className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={
              isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((current) => !current)}
            className={cn(
              'inline-flex size-10 cursor-pointer items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4',
              isHeaderSolid
                ? 'text-foreground hover:text-primary'
                : 'text-white hover:text-white/70',
            )}
          >
            {isMenuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
        className={cn(
          'absolute inset-x-0 top-0 z-0 h-dvh bg-background text-foreground transition-[translate,opacity,visibility] duration-500 ease-out motion-reduce:transition-none lg:hidden',
          isMenuOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible -translate-y-3 pointer-events-none opacity-0',
        )}
      >
        <MobileNavigation
          isOpen={isMenuOpen}
          isProductsOpen={isProductsMenuOpen}
          pathname={pathname}
          onProductsOpenChange={() =>
            setIsProductsMenuOpen((current) => !current)
          }
          onNavigate={() => setIsMenuOpen(false)}
        />
      </div>
    </header>
  )
}
