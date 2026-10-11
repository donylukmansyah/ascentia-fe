import { Mail, MessageCircle, Phone, Plus } from 'lucide-react'
import { animate } from 'motion/react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { cn } from '#/lib/utils'

interface SocialDockItem {
  id: string
  label: string
  href: string
  external?: boolean
  icon: React.ReactNode
}

const TRIGGER_SIZE = 56
const DROP_SIZE = 48
const GAP = 12
const DROP_COUNT = 4
const STACK_HEIGHT = TRIGGER_SIZE + DROP_COUNT * (DROP_SIZE + GAP)
const GOO_PAD = 48
const GOO_BLUR = 7

const glyphClass = 'size-5'

const SCROLL_THRESHOLD = 300

// Inline IG glyph: no brand icons in lucide, skip extra dep.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

const SOCIAL_ITEMS: SocialDockItem[] = [
  {
    id: 'email',
    label: 'Email sales@ascentia.co.id',
    href: 'mailto:sales@ascentia.co.id',
    icon: <Mail className={glyphClass} aria-hidden="true" />,
  },
  {
    id: 'phone',
    label: 'Telepon (021) 2932-5739',
    href: 'tel:+622129325739',
    icon: <Phone className={glyphClass} aria-hidden="true" />,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp +62 851-8606-1000',
    href: 'https://wa.me/6285186061000',
    external: true,
    icon: <MessageCircle className={glyphClass} aria-hidden="true" />,
  },
  {
    id: 'instagram',
    label: 'Instagram @ascentia.analitika',
    href: 'https://www.instagram.com/ascentia.analitika/',
    external: true,
    icon: <InstagramIcon className={glyphClass} />,
  },
]

// Drop offset, index 0 = top.
const dropTop = (index: number) =>
  STACK_HEIGHT - TRIGGER_SIZE - (index + 1) * (DROP_SIZE + GAP)

const dropCenterY = (index: number) => dropTop(index) + DROP_SIZE / 2
const triggerCenterY = STACK_HEIGHT - TRIGGER_SIZE / 2

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function SocialDock({ className }: { className?: string }) {
  const reactId = useId().replace(/:/g, '')
  const menuId = `social-dock-menu-${reactId}`
  const gooId = `social-dock-goo-${reactId}`

  const rootRef = useRef<HTMLDivElement>(null)
  const gooRef = useRef<SVGSVGElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const triggerIconRef = useRef<HTMLSpanElement>(null)
  const dropRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const blobRefs = useRef<(SVGCircleElement | null)[]>([])
  const triggerBlobRef = useRef<SVGCircleElement>(null)
  const timers = useRef<number[]>([])
  const animations = useRef<{ stop: () => void }[]>([])

  const [open, setOpen] = useState(false)
  const openRef = useRef(open)
  openRef.current = open

  // FAB shows after hero, always on short pages.
  const [visible, setVisible] = useState(false)
  const visibleRef = useRef(visible)
  visibleRef.current = visible
  const rootAnimations = useRef<{ stop: () => void }[]>([])

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }, [])

  const stopAnimations = useCallback(() => {
    animations.current.forEach((animation) => animation.stop())
    animations.current = []
  }, [])

  const later = useCallback((delay: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, delay * 1000))
  }, [])

  const play = useCallback(
    (...list: ({ stop: () => void } | null | undefined | false)[]) => {
      list.forEach((animation) => {
        if (animation) animations.current.push(animation)
      })
    },
    [],
  )

  const setGooVisible = useCallback((shown: boolean) => {
    if (gooRef.current) gooRef.current.style.opacity = shown ? '1' : '0'
  }, [])

  const setDropsVisible = useCallback((shown: boolean) => {
    dropRefs.current.forEach((drop) => {
      if (drop) drop.style.opacity = shown ? '1' : '0'
    })
  }, [])

  // Park drops in trigger on mount.
  useEffect(() => {
    dropRefs.current.forEach((drop) => {
      if (!drop) return
      drop.style.opacity = '0'
      drop.style.transform = 'scale(0.12)'
    })
    blobRefs.current.forEach((blob) => {
      if (!blob) return
      blob.style.opacity = '0'
      blob.style.transform = 'scale(0.12)'
    })
    setGooVisible(false)
    return () => {
      stopAnimations()
      clearTimers()
    }
  }, [clearTimers, setGooVisible, stopAnimations])

  const runOpen = useCallback(() => {
    stopAnimations()
    clearTimers()
    setOpen(true)
    if (prefersReducedMotion()) {
      setDropsVisible(true)
      dropRefs.current.forEach((drop) => {
        if (drop) drop.style.transform = 'scale(1)'
      })
      return
    }

    // Goo layer animates, crisp drops follow.
    setGooVisible(true)
    blobRefs.current.forEach((blob) => {
      if (blob) blob.style.opacity = '1'
    })
    if (triggerBlobRef.current) triggerBlobRef.current.style.opacity = '1'

    // Trigger pops, icon turns to X.
    if (triggerRef.current) {
      play(
        animate(
          triggerRef.current,
          { scale: [1, 1.14, 1] },
          { duration: 0.32, ease: 'easeOut' },
        ),
      )
    }
    if (triggerIconRef.current) {
      play(
        animate(
          triggerIconRef.current,
          { rotate: 135 },
          { type: 'spring', stiffness: 380, damping: 22 },
        ),
      )
    }

    // Drops pop out bottom-first, staggered.
    SOCIAL_ITEMS.forEach((_item, i) => {
      const order = DROP_COUNT - 1 - i
      const delay = 0.03 + order * 0.055
      const drop = dropRefs.current[i]
      const blob = blobRefs.current[i]
      if (drop) {
        play(
          animate(
            drop,
            { scale: 1 },
            {
              type: 'spring',
              stiffness: 520,
              damping: 17,
              delay,
            },
          ),
          animate(drop, { opacity: [0, 1] }, { duration: 0.12, delay }),
        )
      }
      if (blob) {
        play(
          animate(
            blob,
            { scale: 1 },
            { type: 'spring', stiffness: 520, damping: 17, delay },
          ),
        )
      }
    })

    // Hide goo after land.
    later(0.62, () => {
      play(animate(gooRef.current!, { opacity: [1, 0] }, { duration: 0.16 }))
      later(0.16, () => setGooVisible(false))
    })
  }, [clearTimers, later, play, setDropsVisible, setGooVisible, stopAnimations])

  const runClose = useCallback(
    (fromTrigger: boolean) => {
      stopAnimations()
      clearTimers()
      setOpen(false)
      if (prefersReducedMotion()) {
        setDropsVisible(false)
        dropRefs.current.forEach((drop) => {
          if (drop) drop.style.transform = 'scale(0.12)'
        })
        return
      }

      setGooVisible(true)
      blobRefs.current.forEach((blob) => {
        if (blob) blob.style.opacity = '1'
      })
      if (triggerBlobRef.current) triggerBlobRef.current.style.opacity = '1'

      if (triggerIconRef.current) {
        play(
          animate(
            triggerIconRef.current,
            { rotate: 0 },
            { type: 'spring', stiffness: 380, damping: 24 },
          ),
        )
      }

      // Drops dive back top-first.
      SOCIAL_ITEMS.forEach((_item, i) => {
        const delay = 0.06 + i * 0.045
        const drop = dropRefs.current[i]
        const blob = blobRefs.current[i]
        if (drop) {
          play(
            animate(
              drop,
              { scale: 0.12 },
              { duration: 0.18, ease: 'easeIn', delay },
            ),
            animate(
              drop,
              { opacity: [1, 0] },
              { duration: 0.1, ease: 'easeIn', delay: delay + 0.05 },
            ),
          )
        }
        if (blob) {
          play(
            animate(
              blob,
              { scale: 0.12 },
              { duration: 0.18, ease: 'easeIn', delay },
            ),
          )
        }
      })

      if (fromTrigger && triggerRef.current) {
        play(
          animate(
            triggerRef.current,
            { scale: [1.14, 0.95, 1] },
            {
              duration: 0.42,
              times: [0.25, 0.6, 1],
              ease: 'easeOut',
              delay: 0.26,
            },
          ),
        )
      }

      later(0.5, () => {
        play(animate(gooRef.current!, { opacity: [1, 0] }, { duration: 0.14 }))
        later(0.14, () => {
          setGooVisible(false)
          setDropsVisible(false)
        })
      })
    },
    [clearTimers, later, play, setDropsVisible, setGooVisible, stopAnimations],
  )

  const toggle = useCallback(() => {
    if (openRef.current) runClose(true)
    else runOpen()
  }, [runClose, runOpen])

  // FAB shows after hero, always on short pages.
  useEffect(() => {
    let frame: number | null = null

    const applyVisibility = (shown: boolean) => {
      if (visibleRef.current === shown) return
      setVisible(shown)
      if (!shown && openRef.current) runClose(false)
      const root = rootRef.current
      if (!root) return
      rootAnimations.current.forEach((animation) => animation.stop())
      rootAnimations.current = []
      if (prefersReducedMotion()) {
        root.style.opacity = shown ? '1' : '0'
        root.style.transform = shown ? 'scale(1)' : 'scale(0.6)'
        return
      }
      if (shown) {
        rootAnimations.current.push(
          animate(
            root,
            { opacity: [0, 1], scale: [0.5, 1.1, 1] },
            { duration: 0.38, ease: 'easeOut' },
          ),
        )
      } else {
        rootAnimations.current.push(
          animate(
            root,
            { opacity: 0, scale: 0.7 },
            { duration: 0.18, ease: 'easeIn' },
          ),
        )
      }
    }

    const evaluate = () => {
      frame = null
      const canScroll =
        document.documentElement.scrollHeight > window.innerHeight + 50
      applyVisibility(canScroll ? window.scrollY > SCROLL_THRESHOLD : true)
    }

    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(evaluate)
    }

    evaluate()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame !== null) window.cancelAnimationFrame(frame)
      rootAnimations.current.forEach((animation) => animation.stop())
      rootAnimations.current = []
    }
  }, [runClose])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) runClose(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      runClose(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, runClose])

  return (
    <div
      ref={rootRef}
      aria-hidden={!visible}
      style={{ opacity: 0 }}
      className={cn(
        'fixed right-5 bottom-5 z-40 sm:right-6 sm:bottom-6',
        !visible && 'pointer-events-none',
        className,
      )}
    >
      <div
        className="relative"
        style={{ width: TRIGGER_SIZE, height: STACK_HEIGHT }}
      >
        <svg
          ref={gooRef}
          width={TRIGGER_SIZE + GOO_PAD * 2}
          height={STACK_HEIGHT + GOO_PAD * 2}
          viewBox={`0 0 ${TRIGGER_SIZE + GOO_PAD * 2} ${STACK_HEIGHT + GOO_PAD * 2}`}
          className="pointer-events-none absolute opacity-0"
          style={{ left: -GOO_PAD, top: -GOO_PAD }}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter id={gooId} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation={GOO_BLUR}
                result="blur"
              />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
          <g filter={`url(#${gooId})`}>
            <circle
              ref={triggerBlobRef}
              cx={GOO_PAD + TRIGGER_SIZE / 2}
              cy={GOO_PAD + triggerCenterY}
              r={TRIGGER_SIZE / 2}
              className="fill-[var(--accent)] [transform-box:fill-box] [transform-origin:center]"
            />
            {SOCIAL_ITEMS.map((_item, i) => (
              <circle
                key={SOCIAL_ITEMS[i].id}
                ref={(el) => {
                  blobRefs.current[i] = el
                }}
                cx={GOO_PAD + TRIGGER_SIZE / 2}
                cy={GOO_PAD + dropCenterY(i)}
                r={DROP_SIZE / 2}
                className="fill-[var(--accent)] [transform-box:fill-box] [transform-origin:center]"
              />
            ))}
          </g>
        </svg>

        <div
          id={menuId}
          role="menu"
          aria-label="Kontak Ascentia"
          inert={!open}
          className="absolute inset-0"
        >
          {SOCIAL_ITEMS.map((item, i) => (
            <a
              key={item.id}
              ref={(el) => {
                dropRefs.current[i] = el
              }}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
              role="menuitem"
              aria-label={item.label}
              tabIndex={open ? 0 : -1}
              onClick={() => runClose(false)}
              className="absolute grid cursor-pointer place-items-center rounded-full border border-border bg-background text-primary shadow-[0_3px_6px_-1px_rgb(0_0_0/0.10)] transition-colors outline-none hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
              style={{
                width: DROP_SIZE,
                height: DROP_SIZE,
                left: (TRIGGER_SIZE - DROP_SIZE) / 2,
                top: dropTop(i),
              }}
            >
              {item.icon}
            </a>
          ))}
        </div>

        <button
          ref={triggerRef}
          type="button"
          tabIndex={visible ? 0 : -1}
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          aria-label={open ? 'Tutup menu kontak' : 'Buka menu kontak'}
          className="absolute right-0 bottom-0 grid cursor-pointer place-items-center rounded-full bg-accent text-white shadow-[0_8px_20px_-6px_rgb(0_0_0/0.35)] outline-none transition-[background-color] hover:bg-[var(--brand-dark)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none"
          style={{ width: TRIGGER_SIZE, height: TRIGGER_SIZE }}
        >
          <span ref={triggerIconRef} className="flex">
            <Plus className="size-6" aria-hidden="true" />
          </span>
        </button>
      </div>
    </div>
  )
}

export default SocialDock
