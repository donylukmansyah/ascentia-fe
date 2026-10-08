import { ArrowUpRight } from 'lucide-react'

import { cn } from '#/lib/utils'

interface ContactFormProps {
  className?: string
}

export function ContactForm({ className }: ContactFormProps) {
  return (
    <form className={cn('grid content-start gap-4', className)} onSubmit={(event) => event.preventDefault()}>
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
        className="group inline-flex min-h-11 cursor-pointer items-center justify-center gap-3 rounded-full bg-accent px-4 text-xs font-medium text-white transition-[background-color,translate] duration-200 hover:-translate-y-0.5 hover:bg-[var(--brand-dark)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none"
      >
        Send enquiry
        <span className="grid size-8 place-items-center rounded-full bg-white text-foreground">
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </span>
      </button>
    </form>
  )
}
