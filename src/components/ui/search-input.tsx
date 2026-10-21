import { forwardRef } from 'react'
import { Loader2, Search, X } from 'lucide-react'

import { useLanguage } from '#/lib/i18n'
import { cn } from '#/lib/utils'

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  loading?: boolean
  label?: string
  containerClassName?: string
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      value,
      onChange,
      onClear,
      loading = false,
      label,
      placeholder,
      className,
      containerClassName,
      id,
      disabled,
      ...props
    },
    ref,
  ) {
    const { t } = useLanguage()
    const inputId = id || 'search-input'
    const resolvedLabel = label ?? t('common.search', 'Search')
    const resolvedPlaceholder =
      placeholder ?? `${t('common.search', 'Search')}...`

    const handleClear = () => {
      if (onClear) {
        onClear()
      } else {
        onChange('')
      }
    }

    return (
      <div className={cn('relative w-full', containerClassName)}>
        <label htmlFor={inputId} className="sr-only">
          {resolvedLabel}
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          {...props}
          ref={ref}
          id={inputId}
          type="search"
          value={value}
          disabled={disabled}
          placeholder={resolvedPlaceholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'min-h-11 w-full rounded-full border border-border bg-white py-2.5 pr-10 pl-10 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden',
            className,
          )}
        />
        <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1.5">
          {loading && (
            <Loader2
              className="size-4 animate-spin text-primary"
              aria-label={t('common.searching', 'Searching...')}
            />
          )}
          {value.length > 0 && (
            <button
              type="button"
              aria-label={t('ui.clearSearch', 'Clear search')}
              onClick={handleClear}
              className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    )
  },
)
