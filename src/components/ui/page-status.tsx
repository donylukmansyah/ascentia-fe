import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '#/lib/utils'

interface PageStatusProps {
  title: string
  description?: string
  icon?: LucideIcon
  visual?: ReactNode
  headingId?: string
  className?: string
  children?: ReactNode
  // 'alert' for load failures; omit for not-found/404
  role?: 'alert'
}

// Shared full-page status: 404, not-found, load errors
export function PageStatus({
  title,
  description,
  icon: Icon,
  visual,
  headingId,
  className,
  children,
  role,
}: PageStatusProps) {
  return (
    <section
      role={role}
      aria-labelledby={headingId}
      className={cn(
        'bg-background px-5 pt-36 pb-20 sm:pt-44 sm:pb-28',
        className,
      )}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        {visual ??
          (Icon && (
            <div className="flex size-16 items-center justify-center rounded-full bg-muted/60 text-foreground/70">
              <Icon className="size-8" aria-hidden="true" />
            </div>
          ))}
        <h1
          id={headingId}
          className={cn(
            'text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl',
            (visual || Icon) && 'mt-8',
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-description-text">
            {description}
          </p>
        )}
        {children && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {children}
          </div>
        )}
      </div>
    </section>
  )
}
