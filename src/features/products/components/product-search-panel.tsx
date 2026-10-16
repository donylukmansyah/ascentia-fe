import { useState } from 'react'

import { SearchInput } from '#/components/ui/search-input'

import { productSearchContent } from '../constants/brands-hero'

interface ProductSearchPanelProps {
  id?: string
  heading?: string
  label?: string
  placeholder?: string
  value?: string
  loading?: boolean
  onQueryChange?: (value: string) => void
  onClear?: () => void
}

export function ProductSearchPanel({
  id = 'brands-content',
  heading = productSearchContent.heading,
  label = productSearchContent.label,
  placeholder = productSearchContent.placeholder,
  value,
  loading = false,
  onQueryChange,
  onClear,
}: ProductSearchPanelProps = {}) {
  const [internalQuery, setInternalQuery] = useState('')
  const query = value ?? internalQuery
  const inputId = `${id}-search`

  const handleChange = (next: string) => {
    if (value === undefined) setInternalQuery(next)
    onQueryChange?.(next)
  }

  const handleClear = () => {
    if (value === undefined) setInternalQuery('')
    if (onClear) {
      onClear()
    } else {
      onQueryChange?.('')
    }
  }

  return (
    <section
      id={id}
      aria-label={heading}
      className="relative z-10 -mt-8 scroll-mt-24 sm:-mt-12"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="rounded-t-2xl bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold tracking-[-0.02em] text-foreground sm:text-xl">
              {heading}
            </h2>
            <div className="w-full shrink-0 sm:w-64 lg:w-72">
              <SearchInput
                id={inputId}
                label={label}
                value={query}
                loading={loading}
                onChange={handleChange}
                onClear={handleClear}
                placeholder={placeholder}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
