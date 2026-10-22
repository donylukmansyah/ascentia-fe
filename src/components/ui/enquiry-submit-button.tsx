import { ArrowUpRight, Loader2 } from 'lucide-react'

import { cn } from '#/lib/utils'

interface EnquirySubmitButtonProps {
  label: string
  submittingLabel: string
  isSubmitting: boolean
  disabled?: boolean
  className?: string
}

export function EnquirySubmitButton({
  label,
  submittingLabel,
  isSubmitting,
  disabled,
  className,
}: EnquirySubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isSubmitting}
      aria-busy={isSubmitting}
      className={cn(
        'group/cta relative inline-flex min-h-11 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-accent px-4 text-[13px] font-medium text-white transition-[background-color,color,translate] duration-200 ease hover:-translate-y-0.5 hover:bg-[var(--brand-dark)] hover:text-white focus-visible:bg-[var(--brand-dark)] focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-70 motion-reduce:transition-none',
        className,
      )}
    >
      <span className="relative z-10 pr-9 transition-[color,translate] duration-300 ease-out group-hover/cta:translate-x-9 group-focus-visible/cta:translate-x-9 motion-reduce:transition-none">
        {isSubmitting ? submittingLabel : label}
      </span>
      <span className="absolute left-full top-1/2 z-0 grid size-9 -translate-x-[115%] -translate-y-1/2 place-items-center rounded-full bg-white text-foreground transition-[left,translate] duration-400 ease-out group-hover/cta:left-0 group-hover/cta:translate-x-[15%] group-focus-visible/cta:left-0 group-focus-visible/cta:translate-x-[15%] motion-reduce:transition-none">
        {isSubmitting ? (
          <Loader2
            className="size-4 animate-spin text-accent"
            aria-hidden="true"
          />
        ) : (
          <ArrowUpRight
            className="size-4 transition-transform duration-300 ease-out group-hover/cta:rotate-45 group-focus-visible/cta:rotate-45 motion-reduce:transition-none"
            aria-hidden="true"
          />
        )}
      </span>
    </button>
  )
}
