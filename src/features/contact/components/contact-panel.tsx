import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { Reveal } from '#/components/ui/reveal'
import { cn } from '#/lib/utils'

import { ContactForm } from './contact-form'

interface ContactPanelProps {
  className?: string
  id?: string
  officeHash?: string
  showPageLink?: boolean
}

export function ContactPanel({
  className,
  id,
  officeHash,
  showPageLink = true,
}: ContactPanelProps) {
  return (
    <section
      id={id}
      tabIndex={id ? -1 : undefined}
      aria-labelledby="contact-panel-heading"
      className={cn('overflow-x-clip', className)}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="relative grid overflow-visible border border-border bg-background shadow-[0_2px_8px_-6px_rgb(0_0_0/0.12)] lg:grid-cols-[1.2fr_0.8fr]">
          <span
            className="absolute -top-3 -left-2 text-xl leading-none text-primary"
            aria-hidden="true"
          >
            +
          </span>
          <span
            className="absolute -top-3 -right-2 text-xl leading-none text-primary"
            aria-hidden="true"
          >
            +
          </span>
          <span
            className="absolute -bottom-3 -left-2 text-xl leading-none text-primary"
            aria-hidden="true"
          >
            +
          </span>
          <span
            className="absolute -right-2 -bottom-3 text-xl leading-none text-primary"
            aria-hidden="true"
          >
            +
          </span>

          <Reveal variant="right" className="p-7 sm:p-10 lg:px-12 lg:py-11">
            <p className="text-[10px] font-bold tracking-[0.12em] text-primary uppercase sm:text-[11px]">
              Contact Us
            </p>
            <h2
              id="contact-panel-heading"
              className="mt-2 max-w-md text-[clamp(2rem,3.4vw,3rem)] leading-[1.04] font-bold tracking-[-0.045em] text-foreground"
            >
              Tell us what you need to analyse
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed font-normal text-description-text sm:text-base">
              Share your sample preparation, XRF analysis, or reference material
              specifications. Our engineers in Jakarta and Kendari will
              recommend the exact instrument and workflow.
            </p>

            <div className="mt-8 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              <a
                href="mailto:sales@ascentia.co.id"
                className="group flex min-h-11 items-center gap-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <span className="grid size-10 shrink-0 place-items-center bg-primary/10 text-primary">
                  <Mail className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold">Email</span>
                  <span className="block truncate text-xs text-muted-foreground group-hover:text-foreground">
                    sales@ascentia.co.id
                  </span>
                </span>
              </a>
              <a
                href="tel:+622129325739"
                className="group flex min-h-11 items-center gap-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <span className="grid size-10 shrink-0 place-items-center bg-primary/10 text-primary">
                  <Phone className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-semibold">Phone</span>
                  <span className="block text-xs text-muted-foreground group-hover:text-foreground">
                    (021) 2932-5739
                  </span>
                </span>
              </a>
              <a
                href="https://wa.me/6285186061000"
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-11 items-center gap-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <span className="grid size-10 shrink-0 place-items-center bg-primary/10 text-primary">
                  <MessageCircle className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-semibold">WhatsApp</span>
                  <span className="block text-xs text-muted-foreground group-hover:text-foreground">
                    +62 851-8606-1000
                  </span>
                </span>
              </a>
              <Link
                to="/contact-us"
                hash={officeHash}
                className="group flex min-h-11 cursor-pointer items-center gap-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <span className="grid size-10 shrink-0 place-items-center bg-primary/10 text-primary">
                  <MapPin className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-semibold">Office</span>
                  <span className="block text-xs leading-snug text-muted-foreground group-hover:text-foreground">
                    Business Park Kebon Jeruk D2-12, Jl. Meruya Ilir No. 88,
                    Meruya, Jakarta Barat 11620
                  </span>
                </span>
              </Link>
            </div>

            {showPageLink ? (
              <Link
                to="/contact-us"
                className="mt-7 inline-flex cursor-pointer items-center gap-1 text-[10px] font-medium tracking-[-0.01em] text-foreground underline underline-offset-3 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Open full contact page
                <ArrowUpRight
                  className="size-3 text-primary"
                  aria-hidden="true"
                />
              </Link>
            ) : null}
          </Reveal>

          <Reveal
            variant="left"
            delay={0.15}
            className={cn(
              'border-t border-border p-7 sm:p-10 lg:border-t-0 lg:border-l lg:px-12 lg:py-11',
              showPageLink ? 'bg-background' : 'bg-[#F7F9FC]',
            )}
          >
            <ContactForm className="w-full" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
