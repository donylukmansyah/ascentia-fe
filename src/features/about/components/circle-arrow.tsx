import { ArrowUpRight } from 'lucide-react'

import { cn } from 'cn'

interface CircleArrowProps {
  className?: string
  label?: string
}

export function CircleArrow({ className, label }: CircleArrowProps) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-full border border-white/70 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 group-hover/media-card:border-white group-hover/media-card:bg-white/20 group-hover/media-card:scale-110 motion-reduce:transition-none',
        className,
      )}
    >
      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/media-card:rotate-45 motion-reduce:transition-none" />
    </span>
  )
}
