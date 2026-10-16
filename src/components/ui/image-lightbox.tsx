import { useRef, useState } from 'react'
import type { ComponentProps, RefObject } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react'

import { cn } from '#/lib/utils'

export interface LightboxImage {
  id: string
  src: string
  srcSet?: string
  alt: string
}

export function ImageWithFallback(props: ComponentProps<'img'>) {
  const [failed, setFailed] = useState(false)
  return failed ? (
    <span
      role={props.alt ? 'img' : undefined}
      aria-hidden={props.alt ? undefined : true}
      aria-label={props.alt ? `${props.alt} unavailable` : undefined}
      className={cn(
        'flex items-center justify-center text-muted-foreground',
        props.className,
      )}
    >
      <ImageOff className="size-8" aria-hidden="true" />
    </span>
  ) : (
    <img {...props} onError={() => setFailed(true)} />
  )
}

export function ImageLightbox({
  images,
  selectedId,
  onSelect,
  onClose,
  returnFocus,
  title = 'Photo viewer',
  closeAriaLabel = 'Close photo viewer',
}: {
  images: readonly LightboxImage[]
  selectedId: string | null
  onSelect: (id: string) => void
  onClose: () => void
  returnFocus: RefObject<HTMLElement | null>
  title?: string
  closeAriaLabel?: string
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const selected = images.find((image) => image.id === selectedId)
  const index = selected ? images.indexOf(selected) : -1

  function move(direction: number) {
    const next = images.at((index + direction + images.length) % images.length)
    if (next) onSelect(next.id)
  }

  return (
    <Dialog.Root
      open={Boolean(selected)}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-2xl transition-opacity duration-200 ease-out data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          initialFocus={closeRef}
          finalFocus={returnFocus}
          onKeyDown={(event) => {
            if (
              event.altKey ||
              event.ctrlKey ||
              event.metaKey ||
              images.length < 2
            )
              return
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
            event.preventDefault()
            move(event.key === 'ArrowRight' ? 1 : -1)
          }}
          className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center p-4 outline-none transition-[opacity,scale] duration-200 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 sm:p-8 motion-reduce:transition-none"
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>

          <Dialog.Close
            ref={closeRef}
            aria-label={closeAriaLabel}
            className="pointer-events-auto absolute top-6 right-6 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
          >
            <X className="size-5" aria-hidden="true" />
          </Dialog.Close>

          {images.length > 1 && (
            <p
              role="status"
              aria-atomic="true"
              className="absolute top-6 left-6 z-50 text-sm font-medium tabular-nums text-white/80 select-none"
            >
              {index + 1} / {images.length}
            </p>
          )}

          {images.length > 1 && (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => move(-1)}
              className="pointer-events-auto absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
          )}

          <div className="relative flex max-h-[85vh] max-w-[90vw] items-center justify-center">
            {selected && (
              <ImageWithFallback
                key={selected.src}
                src={selected.src}
                srcSet={selected.srcSet}
                sizes="90vw"
                alt={selected.alt || `Photo ${index + 1}`}
                draggable={false}
                decoding="async"
                className="pointer-events-auto max-h-[85vh] max-w-[90vw] rounded-xl object-contain select-none shadow-2xl"
              />
            )}
          </div>

          {images.length > 1 && (
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => move(1)}
              className="pointer-events-auto absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          )}

          {selected?.alt && (
            <Dialog.Description className="pointer-events-auto absolute bottom-6 inset-x-6 z-50 line-clamp-2 text-center text-sm text-white/80 select-none">
              {selected.alt}
            </Dialog.Description>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
