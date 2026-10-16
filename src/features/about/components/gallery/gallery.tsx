import * as React from 'react'
import { motion } from 'motion/react'
import type { Transition } from 'motion/react'

import { ImageLightbox } from '#/components/ui/image-lightbox'
import { cn } from '#/lib/utils'

import type { GalleryPhoto } from '../../constants/gallery'

type GalleryContextValue = {
  selected: GalleryPhoto | null
  select: (photo: GalleryPhoto | null) => void
  photos: GalleryPhoto[]
}

const GalleryContext = React.createContext<GalleryContextValue | null>(null)

// Shared-element spring reused by grid and modal.
const spring: Transition = {
  type: 'spring',
  stiffness: 350,
  damping: 35,
  mass: 1,
}

function useGallery() {
  const context = React.useContext(GalleryContext)
  if (!context) throw new Error('Gallery image needs a Gallery parent')
  return context
}

export function Gallery({
  children,
  photos = [],
}: {
  children: React.ReactNode
  photos?: GalleryPhoto[]
}) {
  const [selected, setSelected] = React.useState<GalleryPhoto | null>(null)
  const returnFocus = React.useRef<HTMLElement | null>(null)

  const value = React.useMemo(
    () => ({
      selected,
      select: (photo: GalleryPhoto | null) => {
        if (photo) {
          returnFocus.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null
        }
        setSelected(photo)
      },
      photos,
    }),
    [selected, photos],
  )

  return (
    <GalleryContext.Provider value={value}>
      {children}
      <ImageLightbox
        images={photos}
        selectedId={selected?.id ?? null}
        onSelect={(id) => setSelected(photos.find((p) => p.id === id) ?? null)}
        onClose={() => setSelected(null)}
        returnFocus={returnFocus}
        title="Gallery viewer"
        closeAriaLabel="Close gallery"
      />
    </GalleryContext.Provider>
  )
}

export function GalleryGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('columns-1 gap-4 sm:columns-2 lg:columns-3', className)}>
      {children}
    </div>
  )
}

export function GalleryImage({
  photo,
  className,
}: {
  photo: GalleryPhoto
  className?: string
}) {
  const { select } = useGallery()
  return (
    <motion.figure
      whileHover="hover"
      whileTap="tap"
      className={cn(
        'relative mb-4 break-inside-avoid cursor-zoom-in overflow-hidden rounded-xl',
        className,
      )}
      onClick={() => select(photo)}
    >
      <motion.img
        layoutId={`inside-ascentia-${photo.id}`}
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        className="h-auto w-full rounded-xl object-cover"
        variants={{ hover: { scale: 0.98 }, tap: { scale: 0.95 } }}
        transition={spring}
      />
      <motion.figcaption
        aria-hidden="true"
        variants={{ hover: { opacity: 1 }, tap: { opacity: 1 } }}
        initial={{ opacity: 0 }}
        className="pointer-events-none absolute inset-0 rounded-xl bg-black/10"
        transition={{ duration: 0.2 }}
      />
    </motion.figure>
  )
}
