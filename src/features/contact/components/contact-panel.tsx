import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { Reveal } from '#/components/ui/reveal'
import { cn } from '#/lib/utils'
import { useLanguage } from '#/lib/i18n'

import { ContactForm } from './contact-form'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.149-.198.297-.767.967-.94 1.164-.173.198-.347.223-.644.074-.297-.148-1.255-.463-2.39-1.477-.883-.787-1.478-1.76-1.65-2.057-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.496.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.298-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.148.198 2.095 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.414.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.868 9.868 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.375a9.868 9.868 0 0 1-1.509-5.26c.001-5.447 4.428-9.876 9.878-9.876a9.844 9.844 0 0 1 6.987 2.897 9.843 9.843 0 0 1 2.896 6.988c-.002 5.447-4.429 9.876-9.88 9.876m8.392-18.263A11.79 11.79 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892a11.84 11.84 0 0 0 1.582 5.96L0 24l6.335-1.662a11.868 11.868 0 0 0 5.709 1.454h.005c6.554 0 11.89-5.336 11.893-11.893a11.82 11.82 0 0 0-3.499-8.377Z" />
    </svg>
  )
}

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
  const { t } = useLanguage()

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
            <p className="section-kicker">
              {t('contact.kicker', 'Contact Us')}
            </p>
            <h2
              id="contact-panel-heading"
              className="section-title mt-2 max-w-md"
            >
              {t('contact.heading', 'Tell us what you need to analyse')}
            </h2>
            <p className="section-description mt-4 max-w-md">
              {t(
                'contact.description',
                'Share your sample preparation, XRF analysis, or reference material specifications. Our engineers in Jakarta and Kendari will recommend the exact instrument and workflow.',
              )}
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
                  <span className="block text-xs font-semibold">
                    {t('contact.emailLabel', 'Email')}
                  </span>
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
                  <span className="block text-xs font-semibold">
                    {t('contact.phoneLabel', 'Phone')}
                  </span>
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
                  <WhatsAppIcon className="size-4" />
                </span>
                <span>
                  <span className="block text-xs font-semibold">
                    {t('contact.whatsappLabel', 'WhatsApp')}
                  </span>
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
                  <span className="block text-xs font-semibold">
                    {t('contact.officeLabel', 'Office')}
                  </span>
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
                {t('contact.openPage', 'Open full contact page')}
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
            className="border-t border-border bg-[#F7F9FC] p-7 sm:p-10 lg:border-t-0 lg:border-l lg:px-12 lg:py-11"
          >
            <ContactForm className="w-full" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
