import { AlertCircle, Loader2, RotateCw } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { useLanguage } from '#/lib/i18n'
import { cn } from '#/lib/utils'

export interface QueryErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  isRetrying?: boolean
  variant?: 'card' | 'inline' | 'compact'
  className?: string
}

// Reusable error state for API and network failures
export function QueryErrorState({
  title,
  message,
  onRetry,
  isRetrying = false,
  variant = 'card',
  className,
}: QueryErrorStateProps) {
  const { t } = useLanguage()
  const resolvedTitle = title ?? t('ui.dataError', 'Unable to load data')
  const resolvedMessage =
    message ??
    t(
      'ui.connectionError',
      'We are having trouble reaching the server. Please try again.',
    )

  if (variant === 'compact') {
    return (
      <div
        role="alert"
        className={cn(
          'flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground',
          className,
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="truncate">{resolvedMessage}</span>
        </div>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="h-8 shrink-0 cursor-pointer gap-1.5 px-3 text-xs"
          >
            {isRetrying ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <RotateCw className="size-3.5" aria-hidden="true" />
            )}
            <span>{t('common.tryAgain', 'Try again')}</span>
          </Button>
        ) : null}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div
        role="alert"
        className={cn(
          'flex flex-col items-center justify-center gap-3 py-8 text-center text-sm text-muted-foreground',
          className,
        )}
      >
        <AlertCircle
          className="size-5 text-muted-foreground/80"
          aria-hidden="true"
        />
        {resolvedTitle ? (
          <h4 className="text-sm font-semibold text-foreground">
            {resolvedTitle}
          </h4>
        ) : null}
        <p className="max-w-md">{resolvedMessage}</p>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="cursor-pointer gap-1.5"
          >
            {isRetrying ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <RotateCw className="size-3.5" aria-hidden="true" />
            )}
            <span>{t('common.tryAgain', 'Try again')}</span>
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-border/70 bg-muted/20 p-8 text-center sm:p-12',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
        <AlertCircle className="size-6 text-foreground/70" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">
        {resolvedTitle}
      </h3>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">
        {resolvedMessage}
      </p>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-5 cursor-pointer gap-2"
        >
          {isRetrying ? (
            <Loader2
              className="size-4 animate-spin text-primary"
              aria-hidden="true"
            />
          ) : (
            <RotateCw className="size-4" aria-hidden="true" />
          )}
          <span>Try again</span>
        </Button>
      ) : null}
    </div>
  )
}
