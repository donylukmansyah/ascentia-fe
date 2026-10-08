import type { ComponentProps, ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'

import { cn } from 'cn'

type CtaLinkProps = {
  children: ReactNode
  className?: string
  size?: 'default' | 'compact'
  textTone?: 'dark' | 'light'
  to: ComponentProps<typeof Link>['to']
}

export function CtaLink({
  children,
  className,
  size = 'default',
  textTone = 'dark',
  to,
}: CtaLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'group/cta relative inline-flex min-h-[52px] min-w-40 shrink-0 cursor-pointer items-center justify-start overflow-hidden rounded-full bg-accent py-1 pr-1 pl-[1.35rem] text-[0.78rem] font-semibold tracking-[0.02em] transition-[background-color,color,translate] duration-200 ease hover:-translate-y-0.5 hover:bg-[var(--brand-dark)] hover:text-white focus-visible:bg-[var(--brand-dark)] focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none',
        size === 'compact' && 'min-h-9 min-w-0 py-0 pl-3 pr-3.5 text-[11px] font-normal tracking-normal sm:min-h-12 sm:pl-3.5 sm:pr-4 sm:text-[13px]',
        textTone === 'light' ? 'text-white' : 'text-accent-foreground',
        className,
      )}
    >
      <span
        className={cn(
          'relative z-10 whitespace-nowrap pr-[60px] transition-colors duration-300 ease-out group-hover/cta:text-white group-focus-visible/cta:text-white motion-reduce:transition-none',
          size === 'compact' && 'pr-10 sm:pr-12',
        )}
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-full top-1/2 z-0 grid size-11 -translate-x-[115%] -translate-y-1/2 place-items-center rounded-full bg-white text-foreground transition-[left,translate] duration-400 ease-out group-hover/cta:left-0 group-hover/cta:translate-x-[15%] group-focus-visible/cta:left-0 group-focus-visible/cta:translate-x-[15%] motion-reduce:transition-none',
          size === 'compact' && 'size-7 sm:size-9',
        )}
      >
                  <ArrowUpRight className="size-4 transition-transform duration-300 ease-out group-hover/cta:rotate-45 group-focus-visible/cta:rotate-45 motion-reduce:transition-none sm:size-[1.05rem]" />
      </span>
    </Link>
  )
}
