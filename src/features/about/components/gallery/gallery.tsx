import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Transition } from 'motion/react'
import { X } from 'lucide-react'

import { cn } from 'cn'

import type { GalleryPhoto } from '../../constants/gallery'

type GalleryContextValue = {
  selected: GalleryPhoto | null
  select: (photo: GalleryPhoto | null) => void
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

export function Gallery({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = React.useState<GalleryPhoto | null>(null)

  React.useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  // Lock page scroll while the modal is open.
  React.useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [selected])

  const value = React.useMemo(
    () => ({ selected, select: setSelected }),
    [selected],
  )

  return (
    <GalleryContext.Provider value={value}>
      {children}
      <GalleryModal />
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

function GalleryModal() {
  const context = React.useContext(GalleryContext)
  const selected = context?.selected
  const select = context?.select

  return (
    <AnimatePresence>
      {selected && select && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
            onClick={() => select(null)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={selected.alt}
            className="relative z-10 flex h-full w-full cursor-zoom-out items-center justify-center"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={(_, info) => {
              const draggedFar = Math.abs(info.offset.y) > 100
              const flungFast = Math.abs(info.velocity.y) > 300
              if (draggedFar || flungFast) select(null)
            }}
            onClick={() => select(null)}
          >
            <motion.img
              layoutId={`inside-ascentia-${selected.id}`}
              src={selected.src}
              alt={selected.alt}
              draggable={false}
              className="h-auto max-h-[90vh] w-auto max-w-[95vw] rounded-xl object-contain shadow-2xl will-change-transform"
              transition={spring}
            />
          </motion.div>
          <motion.button
            type="button"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="absolute top-6 right-6 z-50 cursor-pointer rounded-full bg-white/10 p-2.5 text-white backdrop-blur-md transition-colors outline-none hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
            onClick={() => select(null)}
            aria-label="Close gallery"
          >
            <X className="size-5" aria-hidden="true" />
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  )
}
