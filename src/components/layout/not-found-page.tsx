import { CtaLink } from '#/components/ui/cta-link'

export function NotFoundPage() {
  return (
    <section
      aria-labelledby="not-found-heading"
      className="bg-background px-5 pt-36 pb-20 sm:pt-44 sm:pb-28"
    >
      <div className="mx-auto max-w-3xl text-center">
        <div
          aria-hidden="true"
          className="flex items-end justify-center text-[clamp(7rem,25vw,14rem)] leading-none font-bold tracking-tight text-primary"
        >
          <span>40</span>
          <span className="relative">
            4
            <img
              src="/maskot/maskot.webp"
              alt=""
              width={2171}
              height={2171}
              className="absolute bottom-0 left-[10%] h-auto w-[1em] max-w-none"
            />
          </span>
        </div>
        <h1
          id="not-found-heading"
          className="mt-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-description-text">
          The page may have moved, or the address may be incorrect. Let’s get
          you back on track.
        </p>
        <div className="mt-8 flex justify-center">
          <CtaLink to="/">Back to home</CtaLink>
        </div>
      </div>
    </section>
  )
}
