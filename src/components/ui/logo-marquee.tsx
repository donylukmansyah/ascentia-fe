import type { CSSProperties } from 'react'

import { cn } from 'cn'

export type LogoMarqueeItem = {
  src: string
  srcSet?: string
  alt: string
}

type LogoMarqueeProps = {
  items: LogoMarqueeItem[]
  label: string
  itemClassName?: string
  imgClassName?: string
  durationSec?: number
}

// 3x dupes keep track wider than screen.
export function LogoMarquee({
  items,
  label,
  itemClassName,
  imgClassName,
  durationSec = 42,
}: LogoMarqueeProps) {
  const looped = [...items, ...items, ...items]
  return (
    <div
      className="brand-marquee group relative overflow-hidden"
      tabIndex={0}
      style={{ '--marquee-duration': `${durationSec}s` } as CSSProperties}
    >
      <div className="brand-marquee__track">
        {[false, true].map((isDuplicate) => (
          <div
            key={String(isDuplicate)}
            className="brand-marquee__content"
            aria-hidden={isDuplicate}
          >
            {looped.map((item, index) => (
              <div
                key={`${item.src}-${index}`}
                className={cn(
                  'flex h-10 shrink-0 items-center justify-center sm:h-12',
                  itemClassName,
                )}
              >
                <img
                  src={item.src}
                  srcSet={item.srcSet}
                  sizes="160px"
                  alt={isDuplicate ? '' : item.alt}
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    'h-full w-auto max-w-none object-contain',
                    imgClassName,
                  )}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div
        className="brand-marquee__edge brand-marquee__edge--left"
        aria-hidden="true"
      />
      <div
        className="brand-marquee__edge brand-marquee__edge--right"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
