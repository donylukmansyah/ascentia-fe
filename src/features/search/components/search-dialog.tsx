import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Autocomplete } from '@base-ui/react/autocomplete'
import { useQueries } from '@tanstack/react-query'
import { Link, useRouterState } from '@tanstack/react-router'
import { ArrowUpRight, ImageOff, Loader2, Search, X } from 'lucide-react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '#/components/ui/dialog'
import { QueryErrorState } from '#/components/ui/query-error-state'
import { getFuzzySuggestion } from '#/lib/fuzzy-search'
import { cn } from '#/lib/utils'

import { getSearch } from '../api/search-api'
import type { SearchGroup, SearchItem } from '../types/search'

const DEFAULT_CANDIDATES = [
  'XRF Scientific',
  'XRF',
  'XRD',
  'Spectroscopy',
  'Phoenix',
  'OREAS',
  'Specac',
  'Mettler Toledo',
  'King Yosion',
  'Brammer Standard',
  'Sample Preparation',
  'Analytical Instruments',
  'Mineral Analysis',
  'Laboratory Equipment',
  'Fusion Machines',
  'Flux',
  'Chemicals',
  'Platinum Labware',
  'Certified Reference Materials',
  'Crusher',
  'Pulveriser',
  'Calibration',
]

const groups: { key: SearchGroup; label: string }[] = [
  { key: 'products', label: 'Products' },
  { key: 'news', label: 'News' },
  { key: 'blogs', label: 'Blogs' },
]

function Thumbnail({ item }: { item: SearchItem }) {
  const [failed, setFailed] = useState(false)
  return (
    <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
      {item.image && !failed ? (
        <img
          src={item.image}
          srcSet={item.imageSrcSet}
          sizes="48px"
          decoding="async"
          alt=""
          width={48}
          height={48}
          onError={() => setFailed(true)}
          className={cn(
            'size-full transition-transform duration-300 ease-out group-hover:scale-105 group-data-[highlighted]:scale-105 motion-reduce:transition-none',
            item.group === 'products' ? 'object-contain p-1' : 'object-cover',
          )}
        />
      ) : (
        <ImageOff className="size-5 text-muted-foreground" aria-hidden="true" />
      )}
    </span>
  )
}

function SearchSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-3 px-3 py-2">
      {[0, 1, 2].map((key) => (
        <div
          key={key}
          className="flex items-center gap-3 motion-safe:animate-pulse"
        >
          <div className="size-12 shrink-0 rounded-md bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/5 rounded bg-muted" />
            <div className="h-2.5 w-1/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SearchDialog({
  open,
  onOpenChange,
  returnFocus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  returnFocus: RefObject<HTMLElement | null>
}) {
  const [draft, setDraft] = useState('')
  const [query, setQuery] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const previousPath = useRef(pathname)
  const trimmed = draft.trim()
  const ready = trimmed.length >= 2 && trimmed === query

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setDraft('')
      setQuery('')
    }
  }, [open])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [query])

  useEffect(() => {
    const timer = setTimeout(() => setQuery(trimmed), 300)
    return () => clearTimeout(timer)
  }, [trimmed])

  useEffect(() => {
    if (previousPath.current !== pathname) onOpenChange(false)
    previousPath.current = pathname
  }, [pathname, onOpenChange])

  const queries = useQueries({
    queries: groups.map(({ key }) => ({
      queryKey: ['global-search', key, query],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getSearch({ data: { query, group: key }, signal }),
      enabled: open && ready,
      staleTime: 60_000,
      retry: false,
    })),
  })
  // ponytail: 4 previews; add a results page for full lists.
  const visibleGroups = groups.map((group, index) => ({
    ...group,
    items: ready ? (queries[index].data ?? []) : [],
  }))
  const items = visibleGroups.flatMap((group) => group.items)
  const allDone = ready && !queries.some((result) => result.isPending)
  const loading =
    trimmed.length >= 2 &&
    (!ready || queries.some((result) => result.isPending))
  const refreshing =
    ready && queries.some((result) => result.isFetching && result.data)
  const failures = ready ? queries.filter((result) => result.isError).length : 0

  const knownSearchTitlesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    for (const item of items) {
      knownSearchTitlesRef.current.add(item.title)
    }
  }, [items])

  const candidates = useMemo(() => {
    const set = new Set<string>(DEFAULT_CANDIDATES)
    for (const title of knownSearchTitlesRef.current) {
      set.add(title)
      const words = title.split(/[\s–—\-–/,]+/).filter((w) => w.length >= 3)
      for (const w of words) set.add(w)
    }
    return Array.from(set)
  }, [items])

  const suggestion = useMemo(() => {
    if (items.length > 0 || !allDone || failures > 0) return null
    return getFuzzySuggestion(candidates, trimmed)
  }, [candidates, items.length, allDone, failures, trimmed])

  const status =
    trimmed.length < 2
      ? 'Type at least 2 characters to search.'
      : loading
        ? 'Searching products, news and blogs.'
        : refreshing
          ? 'Updating search results.'
          : `${items.length} results shown.${failures ? ` ${failures} search groups unavailable.` : ''}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        id="site-search-dialog"
        initialFocus={input}
        finalFocus={() => {
          if (returnFocus.current?.isConnected) return returnFocus.current
          return document.querySelector<HTMLElement>(
            '[data-site-search-trigger]',
          )
        }}
      >
        <DialogTitle className="sr-only">Search Ascentia</DialogTitle>
        <DialogDescription className="sr-only">
          Find products, news and blogs across Ascentia.
        </DialogDescription>
        <Autocomplete.Root
          items={items}
          filteredItems={items}
          value={draft}
          onValueChange={setDraft}
          itemToStringValue={(item: SearchItem) => item.title}
          inline
          open
          autoHighlight="always"
          onOpenChange={(_, details) => {
            if (details.reason === 'escape-key') onOpenChange(false)
          }}
        >
          <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
            <Search
              className="size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <Autocomplete.Input
              ref={input}
              id="global-search-input"
              aria-label="Search products, news and blogs"
              placeholder="Search products, news, blogs..."
              maxLength={200}
              className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            {refreshing ? (
              <Loader2
                className="size-4 shrink-0 text-primary motion-safe:animate-spin"
                aria-hidden="true"
              />
            ) : null}
            {trimmed.length > 0 && (
              <Autocomplete.Clear
                aria-label="Clear search"
                className="flex size-7 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </Autocomplete.Clear>
            )}
            <DialogClose
              aria-label="Close search"
              className="inline-flex h-6 cursor-pointer items-center rounded border border-border bg-muted/60 px-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
            >
              esc
            </DialogClose>
          </div>
          <Autocomplete.Status className="sr-only">
            {status}
          </Autocomplete.Status>
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3"
          >
            {trimmed.length < 2 ? (
              <div className="flex h-56 flex-col items-center justify-center px-4 text-center text-sm text-muted-foreground">
                <p className="font-medium text-foreground/80">
                  Search across Products, News and Blogs
                </p>
                <p className="mt-1 text-xs">
                  Type at least 2 characters to get started.
                </p>
              </div>
            ) : allDone && failures === groups.length ? (
              <QueryErrorState
                variant="inline"
                title="Search unavailable"
                message="We are having trouble reaching the search server. Please try again."
                onRetry={() => {
                  for (const q of queries) {
                    void q.refetch()
                  }
                }}
                isRetrying={queries.some((q) => q.isFetching)}
                className="py-12"
              />
            ) : allDone && items.length === 0 && !failures ? (
              <div className="flex h-56 flex-col items-center justify-center px-4 text-center text-sm text-muted-foreground">
                <p className="font-medium text-foreground/80">
                  No results found for &ldquo;{trimmed}&rdquo;
                </p>
                {suggestion ? (
                  <p className="mt-2 text-xs">
                    Did you mean{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(suggestion)
                        setQuery(suggestion)
                      }}
                      className="cursor-pointer font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
                    >
                      {suggestion}
                    </button>
                    ?
                  </p>
                ) : (
                  <p className="mt-1 text-xs">
                    Try searching with different keywords.
                  </p>
                )}
              </div>
            ) : (
              <Autocomplete.List
                aria-label="Search results"
                className="space-y-2"
              >
                {visibleGroups.map((group, index) => {
                  const isPending = !ready || queries[index].isPending
                  const isError = queries[index].isError
                  const hasItems = group.items.length > 0

                  if (!isPending && !isError && !hasItems) {
                    return null
                  }

                  return (
                    <Autocomplete.Group key={group.key}>
                      <Autocomplete.GroupLabel className="sticky top-0 z-10 -mx-2 mb-1 bg-background/95 px-5 py-2 text-xs font-semibold text-muted-foreground backdrop-blur-xs">
                        {group.label}
                        {group.items.length ? (
                          <span className="ml-2 font-normal">
                            {group.items.length} matches
                          </span>
                        ) : null}
                      </Autocomplete.GroupLabel>
                      {isPending ? (
                        <SearchSkeleton />
                      ) : isError ? (
                        <div className="px-3 py-3 text-sm text-muted-foreground">
                          {group.label} search is unavailable.{' '}
                          <button
                            type="button"
                            onClick={() => void queries[index].refetch()}
                            className="cursor-pointer font-medium text-foreground underline underline-offset-4"
                          >
                            Try again
                          </button>
                        </div>
                      ) : (
                        group.items.map((item) => (
                          <Autocomplete.Item
                            key={`${item.group}-${item.id}`}
                            value={item}
                            render={
                              <Link
                                to={
                                  item.group === 'products'
                                    ? '/products/$slug'
                                    : item.group === 'news'
                                      ? '/news/$slug'
                                      : '/blogs/$slug'
                                }
                                params={{ slug: item.slug }}
                              />
                            }
                            onClick={() => onOpenChange(false)}
                            className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 outline-none transition-colors duration-150 ease-out hover:bg-muted data-[highlighted]:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                          >
                            <Thumbnail key={item.image} item={item} />
                            <span className="min-w-0 flex-1">
                              <span className="line-clamp-2 block text-sm font-medium leading-5 transition-colors group-hover:text-primary group-data-[highlighted]:text-primary">
                                {item.title}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                {item.meta}
                              </span>
                            </span>
                            <ArrowUpRight
                              className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-data-[highlighted]:-translate-y-0.5 group-data-[highlighted]:translate-x-0.5 motion-reduce:transition-none"
                              aria-hidden="true"
                            />
                          </Autocomplete.Item>
                        ))
                      )}
                    </Autocomplete.Group>
                  )
                })}
              </Autocomplete.List>
            )}
          </div>
        </Autocomplete.Root>
        <div className="flex shrink-0 items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">
                ↑ ↓
              </kbd>{' '}
              Navigate
            </span>
            <span className="hidden sm:inline">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">
                Enter
              </kbd>{' '}
              Open
            </span>
            <span>
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">
                Esc
              </kbd>{' '}
              Close
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground/75">Ascentia</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
