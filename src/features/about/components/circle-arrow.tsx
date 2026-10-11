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
        'grid size-10 shrink-0 place-items-center rounded-full border border-white/70 bg-white/10 text-white backdrop-blur-sm',
        className,
      )}
    >
      <ArrowUpRight className="size-4" />
    </span>
  )
}
