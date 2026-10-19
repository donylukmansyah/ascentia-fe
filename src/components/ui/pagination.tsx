import type { ComponentProps } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from 'lucide-react'

import { cn } from 'cn'

import { Button } from './button'

function Pagination({ className, ...props }: ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex items-center gap-0.5', className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ComponentProps<typeof Button>, 'size'> &
  ComponentProps<'a'>

function PaginationLink({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? 'outline' : 'ghost'}
      size={size}
      className={cn(className)}
      nativeButton={false}
      render={
        <a
          aria-current={isActive ? 'page' : undefined}
          data-slot="pagination-link"
          data-active={isActive}
          {...props}
        />
      }
    />
  )
}

function PaginationPrevious({
  className,
  text = 'Previous',
  ...props
}: ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn('pl-1.5!', className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text = 'Next',
  ...props
}: ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn('pr-1.5!', className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}

function PagePagination({
  page,
  totalPages,
  onPageChange,
  pageHref,
  className,
  disabled = false,
}: {
  page: number
  totalPages: number
  disabled?: boolean
  pageHref?: (page: number) => string
  onPageChange: (page: number) => void
  className?: string
}) {
  if (totalPages <= 1) return null

  const current = Math.min(Math.max(page, 1), totalPages)
  const pages = [...new Set([1, current - 1, current, current + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((left, right) => left - right)

  return (
    <Pagination className={className}>
      <PaginationContent className="gap-2 sm:gap-3">
        <PaginationItem>
          <Button
            nativeButton={!pageHref}
            role={pageHref ? 'link' : undefined}
            render={
              pageHref ? (
                <a href={current > 1 ? pageHref(current - 1) : undefined} />
              ) : undefined
            }
            variant="outline"
            size="icon"
            disabled={disabled || current === 1}
            onClick={(event) => {
              if (
                pageHref &&
                (event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey ||
                  event.button !== 0)
              )
                return
              if (pageHref) event.preventDefault()
              onPageChange(current - 1)
            }}
            aria-label="Previous page"
            className="size-10 cursor-pointer rounded-[4px] text-primary sm:size-11"
          >
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
          </Button>
        </PaginationItem>
        {pages.map((pageNumber, index) => (
          <PaginationItem key={pageNumber} className="flex items-center gap-2">
            {index > 0 && pageNumber - pages[index - 1] > 1 && (
              <PaginationEllipsis />
            )}
            <Button
              nativeButton={!pageHref}
              role={pageHref ? 'link' : undefined}
              render={pageHref ? <a href={pageHref(pageNumber)} /> : undefined}
              variant={pageNumber === current ? 'default' : 'outline'}
              size="icon"
              disabled={disabled}
              onClick={(event) => {
                if (
                  pageHref &&
                  (event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey ||
                    event.button !== 0)
                )
                  return
                if (pageHref) event.preventDefault()
                onPageChange(pageNumber)
              }}
              aria-label={`Go to page ${pageNumber}`}
              aria-current={pageNumber === current ? 'page' : undefined}
              className={cn(
                'size-10 cursor-pointer rounded-[4px] border-primary sm:size-11',
                pageNumber !== current && 'text-primary',
              )}
            >
              {pageNumber}
            </Button>
          </PaginationItem>
        ))}
        <PaginationItem>
          <Button
            nativeButton={!pageHref}
            role={pageHref ? 'link' : undefined}
            render={
              pageHref ? (
                <a
                  href={
                    current < totalPages ? pageHref(current + 1) : undefined
                  }
                />
              ) : undefined
            }
            variant="outline"
            size="icon"
            disabled={disabled || current === totalPages}
            onClick={(event) => {
              if (
                pageHref &&
                (event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey ||
                  event.button !== 0)
              )
                return
              if (pageHref) event.preventDefault()
              onPageChange(current + 1)
            }}
            aria-label="Next page"
            className="size-10 cursor-pointer rounded-[4px] text-primary sm:size-11"
          >
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

function PaginationEllipsis({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  PagePagination,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
