import type { ReactNode } from 'react'

import { cn } from 'cn'

interface MediaCardProps {
  image: string
  imageAlt: string
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function MediaCard({
  image,
  imageAlt,
  title,
  description,
  action,
  className,
}: MediaCardProps) {
  return (
    <article
      className={cn(
        'relative isolate flex min-h-[420px] flex-col overflow-hidden rounded-3xl bg-foreground text-white sm:min-h-[480px]',
        className,
      )}
    >
      <img
        src={image}
        alt={imageAlt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-20 size-full object-cover"
      />
      <div
        className="hero-carousel__overlay pointer-events-none absolute inset-0 -z-10 opacity-60"
        aria-hidden="true"
      />
      <div
        className="hero-carousel__noise pointer-events-none absolute inset-0 -z-10 !opacity-[0.28] mix-blend-overlay"
        aria-hidden="true"
      />
      <div className="flex flex-1 flex-col justify-between gap-16 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-2xl font-medium tracking-[0.25em] text-white uppercase sm:text-3xl">
            {title}
          </h3>
          {action}
        </div>
        <p className="max-w-md text-sm leading-relaxed font-normal text-white/85">
          {description}
        </p>
      </div>
    </article>
  )
}
