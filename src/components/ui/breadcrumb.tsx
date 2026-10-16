import { Fragment } from 'react'
import type { ComponentProps } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronsRight, House } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  to?: ComponentProps<typeof Link>['to']
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  variant?: 'light' | 'dark'
}

export function Breadcrumb({
  items,
  className,
  variant = 'dark',
}: BreadcrumbProps) {
  const isLight = variant === 'light'
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex min-w-0 items-center gap-2 text-xs font-semibold sm:text-sm">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <Fragment key={item.label}>
              {index > 0 && (
                <li aria-hidden="true">
                  <ChevronsRight
                    className={`size-3.5 ${isLight ? 'text-muted-foreground/60' : 'text-white/70'}`}
                  />
                </li>
              )}
              {item.to && !last ? (
                <li className="shrink-0">
                  <Link
                    to={item.to}
                    className={`inline-flex cursor-pointer items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${
                      isLight
                        ? 'text-muted-foreground hover:text-foreground'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {index === 0 && (
                      <House className="size-3.5" aria-hidden="true" />
                    )}
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li
                  aria-current="page"
                  title={item.label}
                  className={`min-w-0 truncate ${isLight ? 'text-primary' : 'text-accent'}`}
                >
                  <span className="sr-only">{item.label}</span>
                  <span aria-hidden="true">{item.label}</span>
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
