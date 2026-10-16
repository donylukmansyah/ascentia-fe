import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Expand } from 'lucide-react'

import {
  ImageLightbox,
  ImageWithFallback,
} from '#/components/ui/image-lightbox'
import { cn } from '#/lib/utils'
import type { ProductImage } from '../types/product'

export function ProductImageGallery({
  images,
  productName,
}: {
  images: ProductImage[]
  productName: string
}) {
  const previewId = useId()
  const railRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLButtonElement>(null)
  const isInitial = useRef(true)
  const [selectedId, setSelectedId] = useState(images.at(0)?.id)
  const [expanded, setExpanded] = useState(false)
  const selected =
    images.find((image) => image.id === selectedId) ?? images.at(0)
  const index = selected ? images.indexOf(selected) : -1

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const button = rail.querySelector<HTMLButtonElement>(
      '[aria-pressed="true"]',
    )
    if (!button) return

    const railWidth = rail.clientWidth
    const buttonLeft = button.offsetLeft
    const buttonWidth = button.offsetWidth
    const targetLeft = buttonLeft - (railWidth - buttonWidth) / 2
    const maxScroll = rail.scrollWidth - railWidth
    const clamped = Math.max(0, Math.min(targetLeft, maxScroll))

    const instant =
      isInitial.current ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    rail.scrollTo({
      left: clamped,
      behavior: instant ? 'instant' : 'smooth',
    })
    isInitial.current = false
  }, [selected?.id, images])

  return (
    <div role="group" aria-label={`${productName} photos`}>
      {selected ? (
        <button
          ref={previewRef}
          id={previewId}
          type="button"
          aria-label="Enlarge product photo"
          aria-haspopup="dialog"
          onClick={() => setExpanded(true)}
          className="group relative flex aspect-square w-full cursor-zoom-in items-center justify-center overflow-hidden bg-[color-mix(in_srgb,var(--primary)_10%,white)] p-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:p-5"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected.src}
              initial={{ opacity: 0.6, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.6, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex size-full items-center justify-center"
            >
              <ImageWithFallback
                src={selected.src}
                srcSet={selected.srcSet}
                sizes="(min-width: 1280px) 440px, (min-width: 1024px) 36vw, (min-width: 640px) 85vw, 90vw"
                alt={selected.alt || `${productName} — photo ${index + 1}`}
                width={600}
                height={600}
                loading="eager"
                decoding="async"
                draggable={false}
                className="h-full w-full object-contain select-none"
              />
            </motion.div>
          </AnimatePresence>
          <span
            className="pointer-events-none absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-xs transition-colors group-hover:bg-white"
            aria-hidden="true"
          >
            <Expand className="size-4" />
          </span>
        </button>
      ) : (
        <div className="flex aspect-square items-center justify-center bg-muted">
          <p role="status" className="text-sm text-muted-foreground">
            Photo unavailable
          </p>
        </div>
      )}
      {images.length > 1 && (
        <div
          ref={railRef}
          role="group"
          aria-label="Choose product photo"
          className="relative mt-3 flex snap-x snap-proximity gap-2.5 overflow-x-auto overscroll-x-contain p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, photoIndex) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Show photo ${photoIndex + 1}${image.alt ? `: ${image.alt}` : ` of ${productName}`}`}
              aria-pressed={selected?.id === image.id}
              aria-controls={previewId}
              onClick={() => setSelectedId(image.id)}
              className={cn(
                'group relative flex size-16 shrink-0 snap-center cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 bg-background p-1 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:size-18',
                selected?.id === image.id
                  ? 'border-primary ring-2 ring-primary/20 scale-[1.02]'
                  : 'border-border/60 opacity-75 hover:border-primary/50 hover:opacity-100 hover:bg-muted',
              )}
            >
              <ImageWithFallback
                key={image.thumbnail}
                src={image.thumbnail}
                alt=""
                width={72}
                height={72}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}
      <ImageLightbox
        images={images}
        selectedId={expanded ? (selected?.id ?? null) : null}
        onSelect={setSelectedId}
        onClose={() => setExpanded(false)}
        returnFocus={previewRef}
      />
    </div>
  )
}
