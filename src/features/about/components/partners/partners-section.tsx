import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Reveal } from '#/components/ui/reveal'

import { aboutPartnersContent } from '../../constants/partners'
import { AboutPartnerCard } from './partner-card'

const AUTOPLAY_MS = 5000

function smoothBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'
}

interface AboutPartnersSectionProps {
  eyebrow?: string
  title?: string
  description?: string
}

export function AboutPartnersSection({
  eyebrow = aboutPartnersContent.eyebrow,
  title = aboutPartnersContent.title,
  description = aboutPartnersContent.description,
}: AboutPartnersSectionProps) {
  const partners = aboutPartnersContent.partners
  const count = partners.length
  const [leftGlobal, setLeftGlobal] = useState(count)
  const dimElRef = useRef<HTMLElement | null>(null)
  const [autoPaused, setAutoPaused] = useState(false)
  const [cycle, setCycle] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const tickingRef = useRef(false)
  const animatingRef = useRef(false)
  const glideRafRef = useRef(0)
  const leftGlobalRef = useRef(count)
  leftGlobalRef.current = leftGlobal
  const flightRef = useRef<number | null>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const dragMovedRef = useRef(false)
  const suppressClickRef = useRef(false)

  const active = partners[((leftGlobal % count) + count) % count]
  const [photoBaseId, setPhotoBaseId] = useState(active.id)

  useEffect(() => {
    if (photoBaseId === active.id) return
    const timer = window.setTimeout(() => setPhotoBaseId(active.id), 950)
    return () => window.clearTimeout(timer)
  }, [active.id, photoBaseId])

  const photoBase =
    partners.find((partner) => partner.id === photoBaseId) ?? active
  const looped = [0, 1, 2].flatMap((copy) =>
    partners.map((partner, index) => ({
      partner,
      index,
      copy,
      global: copy * count + index,
      key: `${partner.id}-${copy}`,
    })),
  )

  const scrollToGlobal = useCallback(
    (globalIndex: number, behavior: ScrollBehavior, commit = false) => {
      const container = scrollContainerRef.current
      if (!container) return
      const cards = container.querySelectorAll<HTMLElement>(
        '[data-partner-card]',
      )
      const el = cards[globalIndex] as HTMLElement | undefined
      if (!el) return
      const pad = parseFloat(getComputedStyle(container).paddingLeft) || 0
      const left =
        el.getBoundingClientRect().left -
        container.getBoundingClientRect().left +
        container.scrollLeft -
        pad
      if (behavior !== 'smooth') {
        container.scrollTo({ left, behavior })
        return
      }
      cancelAnimationFrame(glideRafRef.current)
      const from = container.scrollLeft
      if (Math.abs(left - from) < 1) {
        container.scrollLeft = left
        if (commit) {
          flightRef.current = null
          setLeftGlobal(globalIndex)
        }
        return
      }
      animatingRef.current = true
      container.style.scrollSnapType = 'none'
      const start = performance.now()
      const duration = 600
      const tick = (now: number) => {
        const current = scrollContainerRef.current
        if (!current) {
          animatingRef.current = false
          return
        }
        const t = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - t, 4)
        current.scrollLeft = from + (left - from) * eased
        if (t < 1) {
          glideRafRef.current = requestAnimationFrame(tick)
        } else {
          current.scrollLeft = left
          current.style.scrollSnapType = ''
          animatingRef.current = false
          if (commit) {
            flightRef.current = null
            setLeftGlobal(globalIndex)
          }
        }
      }
      glideRafRef.current = requestAnimationFrame(tick)
    },
    [],
  )

  useLayoutEffect(() => {
    scrollToGlobal(count, 'auto')
  }, [count, scrollToGlobal])

  const cancelGlide = useCallback(() => {
    cancelAnimationFrame(glideRafRef.current)
    animatingRef.current = false
    flightRef.current = null
    const container = scrollContainerRef.current
    if (container) container.style.scrollSnapType = ''
  }, [])

  useEffect(() => {
    const onResize = () => {
      cancelGlide()
      flightRef.current = null
      const mod = ((leftGlobalRef.current % count) + count) % count
      setLeftGlobal(count + mod)
      scrollToGlobal(count + mod, 'auto')
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [count, scrollToGlobal, cancelGlide])

  const handleScroll = useCallback(() => {
    if (tickingRef.current) return
    tickingRef.current = true
    requestAnimationFrame(() => {
      tickingRef.current = false
      const container = scrollContainerRef.current
      if (!container) return
      const cards = container.querySelectorAll<HTMLElement>(
        '[data-partner-card]',
      )
      if (cards.length < count * 3) return
      const middleStart = cards[count] as HTMLElement | undefined
      const thirdStart = cards[count * 2] as HTMLElement | undefined
      if (!middleStart || !thirdStart) return
      const pad = parseFloat(getComputedStyle(container).paddingLeft) || 0
      const contRect = container.getBoundingClientRect()
      const leftOf = (el: HTMLElement) =>
        el.getBoundingClientRect().left - contRect.left + container.scrollLeft
      const start = leftOf(middleStart) - pad
      const setWidth = leftOf(thirdStart) - leftOf(middleStart)
      if (setWidth <= 0) return
      // Desktop wraps across copies; mobile keeps native snap stable.
      if (
        window.matchMedia('(min-width: 768px)').matches &&
        !animatingRef.current
      ) {
        if (container.scrollLeft < start) container.scrollLeft += setWidth
        else if (container.scrollLeft >= start + setWidth)
          container.scrollLeft -= setWidth
      }
      let nearest = count
      let nearestDist = Number.POSITIVE_INFINITY
      cards.forEach((el, gi) => {
        const d = Math.abs(leftOf(el) - pad - container.scrollLeft)
        if (d < nearestDist) {
          nearestDist = d
          nearest = gi
        }
      })
      if (flightRef.current === null) {
        setLeftGlobal((prev) => (prev === nearest ? prev : nearest))
      }
      // Dim follows scroll so the peek never pops.
      let dimTarget: HTMLElement | null = null
      let dimRatio = 1
      if (window.matchMedia('(min-width: 768px)').matches) {
        for (const el of cards) {
          const rect = el.getBoundingClientRect()
          const visible =
            Math.min(rect.right, contRect.right) -
            Math.max(rect.left, contRect.left)
          const ratio = visible / rect.width
          if (ratio > 0.01) {
            dimTarget = el
            dimRatio = ratio
          }
        }
      }
      const prevDimmed = dimElRef.current
      if (dimTarget && dimRatio < 0.99) {
        dimTarget.style.opacity = String(
          0.4 + 0.6 * Math.max(0, Math.min(1, dimRatio)),
        )
        dimTarget.style.pointerEvents = 'none'
        if (prevDimmed && prevDimmed !== dimTarget) {
          prevDimmed.style.opacity = ''
          prevDimmed.style.pointerEvents = ''
        }
        dimElRef.current = dimTarget
      } else if (prevDimmed) {
        prevDimmed.style.opacity = ''
        prevDimmed.style.pointerEvents = ''
        dimElRef.current = null
      }
    })
  }, [count])

  const stepBy = useCallback(
    (step: 1 | -1) => {
      if (document.hidden) return
      let base = flightRef.current ?? leftGlobalRef.current
      if (base < count || base >= count * 2) {
        base = base < count ? base + count : base - count
        scrollToGlobal(base, 'auto')
        setLeftGlobal(base)
      }
      const target = base + step
      flightRef.current = target
      scrollToGlobal(target, smoothBehavior(), true)
    },
    [count, scrollToGlobal],
  )

  const poke = useCallback(() => setCycle((c) => c + 1), [])

  const takeover = useCallback(() => {
    cancelGlide()
    setCycle((c) => c + 1)
  }, [cancelGlide])

  const handleGrab = useCallback(
    (event: { clientX: number; clientY: number }) => {
      dragStartRef.current = { x: event.clientX, y: event.clientY }
      dragMovedRef.current = false
      takeover()
      setAutoPaused(true)
    },
    [takeover],
  )

  const handleMove = useCallback(
    (event: { clientX: number; clientY: number }) => {
      const start = dragStartRef.current
      if (!start || dragMovedRef.current) return
      const drift = Math.max(
        Math.abs(event.clientX - start.x),
        Math.abs(event.clientY - start.y),
      )
      if (drift > 8) dragMovedRef.current = true
    },
    [],
  )

  const handleRelease = useCallback(() => {
    dragStartRef.current = null
    if (dragMovedRef.current) {
      suppressClickRef.current = true
      setCycle((c) => c + 1)
    }
    setAutoPaused(false)
  }, [])

  const handleClickCapture = useCallback(
    (event: { preventDefault: () => void; stopPropagation: () => void }) => {
      if (!suppressClickRef.current) return
      // Dragged pointer must not trigger card select.
      suppressClickRef.current = false
      event.preventDefault()
      event.stopPropagation()
    },
    [],
  )

  const handleWheel = useCallback(
    (event: { deltaX: number; deltaY: number }) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      // Vertical page scroll passes through untouched.
      takeover()
    },
    [takeover],
  )

  useEffect(() => {
    partners.forEach((partner) => {
      const img = new Image()
      img.decoding = 'async'
      img.src = partner.image
    })
    return () => cancelGlide()
  }, [partners, cancelGlide])

  useEffect(() => {
    if (autoPaused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => stepBy(1), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [autoPaused, cycle, stepBy])

  const selectPartner = (index: number) => {
    const base = flightRef.current ?? leftGlobalRef.current
    const options = [index, index + count, index + count * 2]
    const target = options.reduce((a, b) =>
      Math.abs(b - base) < Math.abs(a - base) ? b : a,
    )
    // Active card stays put, no micro-glide.
    if (target === base) return
    flightRef.current = target
    scrollToGlobal(target, smoothBehavior(), true)
    poke()
  }

  const goTo = (direction: 'prev' | 'next') => {
    stepBy(direction === 'next' ? 1 : -1)
    poke()
  }

  return (
    <section
      aria-labelledby="about-partners-heading"
      className="overflow-x-clip bg-white"
      onMouseEnter={() => setAutoPaused(true)}
      onMouseLeave={() => setAutoPaused(false)}
      onFocus={() => setAutoPaused(true)}
      onBlur={(event) => {
        const next = event.relatedTarget
        if (!(next instanceof Node) || !event.currentTarget.contains(next))
          setAutoPaused(false)
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-5 pt-16 sm:px-8 sm:pt-20 lg:px-12 lg:pt-24">
        <Reveal
          variant="up"
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold tracking-[0.12em] text-primary uppercase sm:text-[11px]">
              {eyebrow}
            </p>
            <h2
              id="about-partners-heading"
              className="mt-2 text-[clamp(1.75rem,2.9vw,2.5rem)] leading-[1.04] font-bold tracking-[-0.045em] text-foreground"
            >
              {title}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed font-normal text-description-text sm:text-base lg:pb-2 lg:text-right">
            {description}
          </p>
        </Reveal>
      </div>

      <div className="relative mt-10 overflow-x-clip bg-[#F8FAFC] md:mt-14">
        <Reveal variant="up" delay={0.1}>
          <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-0">
            <div className="relative z-0 order-1 aspect-[4/3] overflow-hidden md:aspect-auto md:h-[600px]">
              <img
                src={photoBase.image}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover object-center"
              />
              <img
                key={active.id}
                src={active.image}
                alt={active.imageAlt}
                loading="lazy"
                decoding="async"
                className="partner-photo-enter absolute inset-0 size-full object-cover object-center"
              />
            </div>

            <div className="relative z-10 order-2 -mt-56 px-5 pb-10 sm:px-8 md:mt-0 md:absolute md:top-1/2 md:right-0 md:left-[calc(50%-148px)] md:-translate-y-1/2 md:px-0 md:pb-0">
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                onPointerDown={handleGrab}
                onPointerMove={handleMove}
                onWheel={handleWheel}
                onKeyDown={takeover}
                onPointerUp={handleRelease}
                onPointerCancel={handleRelease}
                onClickCapture={handleClickCapture}
                tabIndex={0}
                role="region"
                aria-label="Partner brands catalog"
                className="relative -mr-5 flex cursor-grab snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain overflow-y-clip py-8 pr-5 scrollbar-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:cursor-grabbing sm:-mr-8 sm:pr-8 md:mx-0 md:px-1 md:pl-2 md:pr-1"
              >
                {looped.map(({ partner, index, copy, global, key }) => (
                  <div
                    key={key}
                    data-partner-card
                    className="w-[calc(100vw-80px)] shrink-0 snap-start sm:w-[280px] md:w-[250px]"
                  >
                    <AboutPartnerCard
                      partner={partner}
                      active={global === leftGlobal}
                      onSelect={() => selectPartner(index)}
                      tabIndex={copy === 1 ? undefined : -1}
                      className="h-full"
                    />
                  </div>
                ))}
              </div>

              <div
                className="mx-auto mt-4 flex max-w-[620px] items-center justify-end gap-2 px-1 md:px-8"
                role="group"
                aria-label="Partner carousel controls"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Previous partners"
                  onClick={() => goTo('prev')}
                  className="size-9 cursor-pointer rounded-full border border-border bg-white text-[var(--brand-dark)] transition-all hover:border-primary hover:bg-primary hover:text-white"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  aria-label="Next partners"
                  onClick={() => goTo('next')}
                  className="size-9 cursor-pointer rounded-full border border-primary bg-primary text-white shadow-xs transition-all hover:border-[var(--brand-dark)] hover:bg-[var(--brand-dark)]"
                >
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
