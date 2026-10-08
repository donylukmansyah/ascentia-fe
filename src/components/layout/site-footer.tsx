import { ArrowUp } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const footerLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about-us' },
  { label: 'Products', to: '/products' },
  { label: 'Contact Us', to: '/contact-us' },
] as const

export function SiteFooter() {
  const year = new Date().getFullYear()

  function scrollToTop() {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <footer className="relative isolate overflow-hidden border-t border-border/60 bg-background text-foreground">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[0.12em] right-[-0.04em] z-0 select-none whitespace-nowrap text-[clamp(8rem,15vw,15rem)] font-extrabold leading-[0.75] tracking-[-0.08em] text-primary/[0.03]"
      >
        ASCENTIA
      </span>

      <div className="relative z-10 mx-auto w-full max-w-[1536px] px-6 pt-[clamp(4rem,7vw,6rem)] md:px-[clamp(4rem,6.5vw,6rem)]">
        <div className="grid grid-cols-1 gap-y-8 pb-12 sm:grid-cols-2 sm:gap-x-12 md:grid-cols-[1.3fr_1fr_0.55fr] md:gap-x-10 md:pb-12">
          <div className="sm:col-span-2 md:col-span-1">
            <Link
              aria-label="Ascentia Arsya Analitika home"
              className="inline-flex cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              to="/"
            >
              <img
                alt="Ascentia Arsya Analitika"
                className="h-auto w-[200px] max-w-full"
                height="50"
                src="/brand/logo-color.png"
                width="220"
              />
            </Link>
            <p className="mt-5 max-w-[20rem] text-sm leading-relaxed font-normal text-description-text sm:mt-[1.3rem]">
              Analytical instruments, certified reference materials, and
              technical support for laboratories and industry.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-base leading-tight font-bold">
              PT Ascentia
            </h2>
            <address className="not-italic text-sm leading-relaxed text-foreground/70">
              Business Park Kebon Jeruk D2-12
              <br />
              Jl. Meruya Ilir No. 88
              <br />
              Jakarta Barat 11620
            </address>
            <a
              className="mt-4 inline-block cursor-pointer rounded-sm text-sm text-foreground/70 transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              href="mailto:sales@ascentia.co.id"
            >
              sales@ascentia.co.id
            </a>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="mb-4 text-base leading-tight font-bold">
              Explore
            </h2>
            <ul className="grid justify-items-start gap-0">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    className="cursor-pointer rounded-sm text-sm leading-relaxed text-foreground/70 transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                    to={link.to}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col items-start gap-4 border-t border-border/60 py-4 text-[10px] text-foreground/70 sm:flex-row sm:items-center sm:justify-between sm:text-xs">
          <span className="w-full text-center sm:w-auto sm:text-left">
            All Rights Reserved ©{year} Ascentia Arsya Analitika
          </span>
          <div className="flex w-full items-center justify-between gap-5 sm:w-auto">
            <span>Indonesia</span>
            <button
              aria-label="Back to top"
              className="grid size-11 cursor-pointer place-items-center rounded-full border border-primary bg-primary text-primary-foreground transition-[background-color,translate] duration-200 hover:-translate-y-0.5 hover:bg-[var(--brand-dark)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:size-12"
              onClick={scrollToTop}
              type="button"
            >
              <ArrowUp
                aria-hidden="true"
                className="size-5"
                strokeWidth={1.8}
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
