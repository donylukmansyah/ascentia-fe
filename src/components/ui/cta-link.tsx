import type { ComponentProps, ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'

import { cn } from '#/lib/utils'

type CtaLinkProps = {
  children: ReactNode
  className?: string
  size?: 'default' | 'compact'
  to?: ComponentProps<typeof Link>['to']
  href?: string
  target?: ComponentProps<'a'>['target']
  rel?: string
}

const ctaBaseClass = (size: 'default' | 'compact', className?: string) =>
  cn(
    'group/cta relative inline-flex min-h-9 sm:min-h-11 shrink-0 cursor-pointer items-center overflow-hidden rounded-full bg-accent py-1 pr-1 pl-3.5 sm:pl-4 text-xs sm:text-[13px] leading-none font-medium tracking-normal transition-[background-color,color,translate] duration-200 ease hover:-translate-y-0.5 hover:bg-[var(--brand-dark)] hover:text-white focus-visible:bg-[var(--brand-dark)] focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-70 motion-reduce:transition-none text-white',
    size === 'compact' &&
      'min-h-8 sm:min-h-9 py-0.5 pr-1 pl-3 sm:pl-3.5 text-xs',
    className,
  )

function CtaContent({
  children,
  size,
}: {
  children: ReactNode
  size: 'default' | 'compact'
}) {
  return (
    <>
      <span
        className={cn(
          'relative z-10 whitespace-nowrap transition-[translate,color] duration-300 ease-out group-hover/cta:text-white group-focus-visible/cta:text-white motion-reduce:transition-none',
          size === 'compact'
            ? 'pr-[32px] sm:pr-[36px] group-hover/cta:translate-x-5 sm:group-hover/cta:translate-x-6 group-focus-visible/cta:translate-x-5 sm:group-focus-visible/cta:translate-x-6'
            : 'pr-[36px] sm:pr-[46px] group-hover/cta:translate-x-6 sm:group-hover/cta:translate-x-7 group-focus-visible/cta:translate-x-6 sm:group-focus-visible/cta:translate-x-7',
        )}
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1/2 left-[calc(100%-2rem)] sm:left-[calc(100%-2.5rem)] z-0 grid size-7 sm:size-9 -translate-y-1/2 place-items-center rounded-full bg-white text-foreground transition-[left] duration-400 ease-out group-hover/cta:left-1 group-focus-visible/cta:left-1 motion-reduce:transition-none',
          size === 'compact' &&
            'left-[calc(100%-1.75rem)] size-6 sm:left-[calc(100%-2rem)] sm:size-7',
        )}
      >
        <ArrowUpRight
          className={cn(
            'size-3.5 transition-transform duration-200 ease-out group-hover/cta:rotate-45 group-focus-visible/cta:rotate-45 motion-reduce:transition-none',
            size === 'compact' && 'size-3',
          )}
        />
      </span>
    </>
  )
}

export function CtaLink({
  children,
  className,
  size = 'default',
  to = '/',
  href,
  target,
  rel,
}: CtaLinkProps) {
  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={ctaBaseClass(size, className)}
      >
        <CtaContent size={size}>{children}</CtaContent>
      </a>
    )
  }

  return (
    <Link
      to={to}
      target={target}
      rel={rel}
      className={ctaBaseClass(size, className)}
    >
      <CtaContent size={size}>{children}</CtaContent>
    </Link>
  )
}

export function CtaButton({
  children,
  className,
  size = 'default',
  onClick,
  type = 'button',
  disabled,
}: {
  children: ReactNode
  className?: string
  size?: 'default' | 'compact'
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={ctaBaseClass(size, className)}
    >
      <CtaContent size={size}>{children}</CtaContent>
    </button>
  )
}
