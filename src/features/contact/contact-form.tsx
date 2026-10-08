import { ArrowUpRight } from 'lucide-react'

import { cn } from '#/lib/utils'

interface ContactFormProps {
  className?: string
}

export function ContactForm({ className }: ContactFormProps) {
  return (
    <form
      className={cn('grid content-start gap-4', className)}
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="grid gap-1.5 text-[10px] font-bold tracking-[0.08em] text-foreground/75 uppercase">
        Name
        <input
          name="name"
          type="text"
          autoComplete="name"
          required
          className="h-10 border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <label className="grid gap-1.5 text-[10px] font-bold tracking-[0.08em] text-foreground/75 uppercase">
        Work email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-10 border border-border bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <label className="grid gap-1.5 text-[10px] font-bold tracking-[0.08em] text-foreground/75 uppercase">
        Message
        <textarea
          name="message"
          rows={5}
          required
          className="min-h-28 resize-y border border-border bg-background px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <button
        type="submit"
        className="group/cta relative inline-flex min-h-11 w-full cursor-pointer items-center justify-center overflow-hidden rounded-full bg-accent px-4 text-[13px] font-medium text-white transition-[background-color,color,translate] duration-200 ease hover:-translate-y-0.5 hover:bg-[var(--brand-dark)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none"
      >
        <span className="relative z-10 pr-9 transition-[color,translate] duration-300 ease-out group-hover/cta:translate-x-9 group-focus-visible/cta:translate-x-9 motion-reduce:transition-none">
          Send enquiry
        </span>
        <span className="absolute left-full top-1/2 z-0 grid size-9 -translate-x-[115%] -translate-y-1/2 place-items-center rounded-full bg-white text-foreground transition-[left,translate] duration-400 ease-out group-hover/cta:left-0 group-hover/cta:translate-x-[15%] group-focus-visible/cta:left-0 group-focus-visible/cta:translate-x-[15%] motion-reduce:transition-none">
          <ArrowUpRight
            className="size-4 transition-transform duration-300 ease-out group-hover/cta:rotate-45 group-focus-visible/cta:rotate-45 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </span>
      </button>
    </form>
  )
}
