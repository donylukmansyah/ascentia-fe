import { cn } from '#/lib/utils'

type EmptyStateProps = {
  message: string
  className?: string
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-muted/30 p-12 text-center',
        className,
      )}
    >
      <p className="text-base text-muted-foreground">{message}</p>
    </div>
  )
}
