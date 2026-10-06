import { useEffect, useState } from 'react'
import { ChevronDown, Menu, Search, X } from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { useStickyHeader } from '#/hooks/use-sticky-header'
import { cn } from '#/lib/utils'

const navigationItems = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about-us' },
  { label: 'Products', href: '/products' },
  { label: 'News', href: '/news' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Contact Us', href: '/contact-us' },
] as const

const languages = [
  { code: 'en', label: 'English', flag: '/icons/flags/gb.svg' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '/icons/flags/id.svg' },
] as const

type LanguageCode = (typeof languages)[number]['code']

type LanguagePickerProps = {
  language: LanguageCode
  onLanguageChange: (language: LanguageCode) => void
  className?: string
}

function LanguagePicker({
  language,
  onLanguageChange,
  className,
}: LanguagePickerProps) {
  const activeLanguage = languages.find((item) => item.code === language)

  if (!activeLanguage) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4',
          className,
        )}
        aria-label={`Select language, current ${activeLanguage.label}`}
      >
        <img
          src={activeLanguage.flag}
          alt=""
          aria-hidden="true"
          className="size-5 shrink-0 rounded-full border border-foreground/10 object-cover"
        />
        <span className="text-[11px] font-medium tracking-[-0.01em]">
          {activeLanguage.code.toUpperCase()}
        </span>
        <ChevronDown className="size-3 transition-transform duration-200" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 rounded-xl border border-border/60 bg-popover p-1 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.18)]">
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={(value) => {
            if (value === 'en' || value === 'id') {
              onLanguageChange(value)
            }
          }}
        >
          {languages.map((item) => (
            <DropdownMenuRadioItem
              key={item.code}
              value={item.code}
              closeOnClick
              className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors hover:bg-muted focus:bg-muted focus:text-foreground data-checked:bg-muted data-checked:text-foreground"
            >
              <img
                src={item.flag}
                alt=""
                aria-hidden="true"
                className="h-3.5 w-5 shrink-0 rounded-[3px] border border-foreground/10 object-cover"
              />
              <span className="flex-1">{item.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SiteHeader() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const mode = useStickyHeader({ hideOffset: 320 })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [language, setLanguage] = useState<LanguageCode>('en')
  const isSolid = mode !== 'transparent'
  const isHidden = mode === 'hidden'
  // While the mobile menu is open the header behaves as solid so the
  // colored logo and dark controls stay legible on the white overlay.
  const isHeaderSolid = isSolid || isMenuOpen

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Lock body scroll and allow Escape to close while the menu is open.
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
          ? 'bg-background/95 text-foreground shadow-[0_1px_0_rgb(37_37_37/8%),0_12px_32px_-16px_rgb(0_0_0/0.12)] backdrop-blur-md'
          : 'bg-transparent text-white',
        isHidden && !isMenuOpen
          ? 'duration-250 ease-[cubic-bezier(0.4,0,1,1)] -translate-y-full'
          : 'duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-0',
      )}
    >
      <div className="relative z-10 mx-auto flex h-20 max-w-7xl items-center justify-between gap-8 bg-inherit px-5 sm:px-8 lg:h-24 lg:px-12">
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
            className="h-7 w-auto lg:h-8"
            fetchPriority="high"
          />
        </Link>

        <nav aria-label="Primary navigation" className="hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-9">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href

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
          {/* TODO: wire up search overlay/page once search is implemented */}
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

        <button
          type="button"
          aria-label={
            isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
          }
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((current) => !current)}
          className={cn(
            'relative z-10 inline-flex size-10 cursor-pointer items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 lg:hidden',
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

      <div
        id="mobile-navigation"
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
        className={cn(
          'absolute inset-x-0 top-0 z-0 h-dvh bg-background text-foreground transition-[transform,opacity,visibility] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none lg:hidden',
          isMenuOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible -translate-y-3 pointer-events-none opacity-0',
        )}
      >
        <nav
          aria-label="Mobile navigation"
          className="flex h-full flex-col overflow-y-auto px-5 pt-24 pb-10 sm:px-8"
        >
          <ul className="border-t border-foreground/10">
            {navigationItems.map((item, index) => {
              const isActive = pathname === item.href

              return (
                <li
                  key={item.href}
                  className="border-b border-foreground/10"
                  style={{
                    transitionDelay: isMenuOpen ? `${100 + index * 45}ms` : '0ms',
                  }}
                >
                  <Link
                    to={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    tabIndex={isMenuOpen ? 0 : -1}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      'flex min-h-14 items-center justify-between py-1 text-base font-semibold transition-[transform,opacity,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 motion-reduce:transition-none',
                      isMenuOpen
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-2 opacity-0',
                      isActive
                        ? 'text-primary'
                        : 'text-foreground/75 hover:text-primary',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </header>
  )
}
