import { Search } from 'lucide-react'
import { useState } from 'react'

import { productSearchContent } from '../constants/brands-hero'

interface ProductSearchPanelProps {
  id?: string
  heading?: string
  label?: string
  placeholder?: string
  value?: string
  onQueryChange?: (value: string) => void
}

export function ProductSearchPanel({
  id = 'brands-content',
  heading = productSearchContent.heading,
  label = productSearchContent.label,
  placeholder = productSearchContent.placeholder,
  value,
  onQueryChange,
}: ProductSearchPanelProps = {}) {
  const [internalQuery, setInternalQuery] = useState('')
  const query = value ?? internalQuery
  const inputId = `${id}-search`

  const handleChange = (next: string) => {
    if (value === undefined) setInternalQuery(next)
    onQueryChange?.(next)
  }

  return (
    <section
      id={id}
      aria-label={heading}
      className="relative z-10 scroll-mt-24 bg-background"
    >
      <div className="absolute inset-x-0 top-0 -translate-y-1/2">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="rounded-t-2xl bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold tracking-[-0.02em] text-foreground sm:text-xl">
                {heading}
              </h2>
              <div className="relative w-full shrink-0 sm:w-64 lg:w-72">
                <Search
                  className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <label htmlFor={inputId} className="sr-only">
                  {label}
                </label>
                <input
                  id={inputId}
                  type="search"
                  value={query}
                  onChange={(event) => handleChange(event.target.value)}
                  placeholder={placeholder}
                  className="min-h-11 w-full rounded-full border border-border bg-white py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Reserve room for absolute card. */}
      <div className="mx-auto w-full max-w-7xl px-5 pt-6 pb-4 sm:px-8 sm:pt-6 sm:pb-6 lg:px-12" />
    </section>
  )
}
