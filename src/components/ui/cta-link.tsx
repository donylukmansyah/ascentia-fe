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
        'group/cta relative inline-flex min-h-10 shrink-0 cursor-pointer items-center overflow-hidden rounded-full bg-accent py-1 pr-1 pl-3.5 text-xs leading-none font-medium tracking-normal transition-[background-color,color,translate] duration-200 ease hover:-translate-y-0.5 hover:bg-[var(--brand-dark)] hover:text-white focus-visible:bg-[var(--brand-dark)] focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none sm:min-h-[52px] sm:pl-[1.35rem] sm:text-[13px]',
        size === 'compact' && 'min-h-9 py-0 pr-1 pl-3 sm:min-h-11 sm:pl-3.5',
        textTone === 'light' ? 'text-white' : 'text-accent-foreground',
        className,
      )}
    >
      <span
        className={cn(
          'relative z-10 whitespace-nowrap transition-[translate,color] duration-300 ease-out group-hover/cta:text-white group-focus-visible/cta:text-white motion-reduce:transition-none',
          size === 'compact'
            ? 'pr-[38px] group-hover/cta:translate-x-6 group-focus-visible/cta:translate-x-6 sm:pr-[46px] sm:group-hover/cta:translate-x-8 sm:group-focus-visible/cta:translate-x-8'
            : 'pr-[38px] group-hover/cta:translate-x-7 group-focus-visible/cta:translate-x-7 sm:pr-[54px] sm:group-hover/cta:translate-x-9 sm:group-focus-visible/cta:translate-x-9',
        )}
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1/2 left-[calc(100%-2.25rem)] z-0 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white text-foreground transition-[left] duration-400 ease-out group-hover/cta:left-1 group-focus-visible/cta:left-1 motion-reduce:transition-none sm:left-[calc(100%-3rem)] sm:size-11',
          size === 'compact' &&
            'left-[calc(100%-2rem)] size-7 sm:left-[calc(100%-2.25rem)] sm:size-8',
        )}
      >
        <ArrowUpRight className="size-3.5 transition-transform duration-200 ease-out group-hover/cta:rotate-45 group-focus-visible/cta:rotate-45 motion-reduce:transition-none sm:size-4" />
      </span>
    </Link>
  )
}
