import { Inbox } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'

type EmptyStateProps = {
  message: ReactNode
  title?: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}

export function EmptyState({
  message,
  title,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-border/70 bg-muted/20 p-8 text-center sm:p-12',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
        <Icon className="size-6 text-foreground/70" aria-hidden="true" />
      </div>
      {title ? (
        <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      ) : null}
      <p
        className={cn(
          'max-w-md text-sm leading-relaxed text-muted-foreground',
          title ? 'mt-1.5' : 'mt-4',
        )}
      >
        {message}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
