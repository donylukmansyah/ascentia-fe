import { ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

import { Breadcrumb } from '#/components/ui/breadcrumb'

interface BlogsHeroSectionProps {
  imagePosition?: string
  parallaxRange?: number
}

export function BlogsHeroSection({
  imagePosition = 'center 20%',
  parallaxRange = 80,
}: BlogsHeroSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    [-parallaxRange, parallaxRange],
  )

  return (
    <section
      ref={sectionRef}
      aria-labelledby="blogs-hero-heading"
      className="relative isolate flex min-h-[440px] w-full items-center overflow-hidden bg-foreground text-white sm:min-h-[500px] lg:min-h-[560px]"
    >
      <motion.img
        src="/images/blogs/assets-our-blogs.webp"
        alt=""
        fetchPriority="high"
        decoding="async"
        style={{
          objectPosition: imagePosition,
          y: reduceMotion ? 0 : imageY,
        }}
        className="absolute inset-x-0 -top-24 -z-20 h-[calc(100%+12rem)] w-full object-cover"
      />
      <div
        className="hero-carousel__overlay pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />
      <div
        className="hero-carousel__noise pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-24 pt-32 sm:px-8 sm:pb-28 sm:pt-36 lg:px-12 lg:pb-32 lg:pt-40">
        <div className="hero-carousel__copy flex max-w-[min(100%,42rem)] flex-col items-start gap-5 text-left">
          <Breadcrumb
            items={[{ label: 'Home', to: '/' }, { label: 'Blogs' }]}
          />
          <div className="flex items-center gap-3 sm:gap-4">
            <h1
              id="blogs-hero-heading"
              className="text-[clamp(1.875rem,3.4vw,3.375rem)] leading-[1.03] font-bold tracking-[-0.045em] text-white"
            >
              Our Blogs
            </h1>
            <a
              href="#blogs-content"
              aria-label="Explore Blogs content"
              className="group/blogs-hero relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center justify-end rounded-full bg-accent pr-1 transition-[background-color,translate] duration-200 hover:-translate-y-0.5 hover:bg-[var(--brand-dark)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none sm:h-10 sm:w-[4.5rem]"
            >
              <span className="grid size-7 place-items-center rounded-full bg-white text-foreground transition-transform duration-300 ease-out group-hover/blogs-hero:-translate-x-[calc(100%+0.25rem)] group-focus-visible/blogs-hero:-translate-x-[calc(100%+0.25rem)] motion-reduce:transition-none sm:size-8">
                <ArrowUpRight
                  className="size-4 transition-transform duration-200 group-hover/blogs-hero:rotate-45 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </span>
            </a>
          </div>
          <p className="max-w-[34rem] text-sm leading-relaxed font-normal text-white/85 sm:text-base">
            Analytical instruments, trusted materials, and technical support for
            the work behind reliable results.
          </p>
        </div>
      </div>
    </section>
  )
}
