import { useEffect } from 'react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'

import { cn } from '#/lib/utils'

// Trap focus without Base UI inset scrollbar gutter gap.
export function Dialog({
  modal = 'trap-focus',
  ...props
}: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root modal={modal} {...props} />
}
export const DialogClose = DialogPrimitive.Close
export const DialogTitle = DialogPrimitive.Title
export const DialogDescription = DialogPrimitive.Description

function ScrollLock() {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])
  return null
}

export function DialogContent({
  className,
  children,
  ...props
}: DialogPrimitive.Popup.Props) {
  return (
    <DialogPrimitive.Portal>
      <ScrollLock />
      <DialogPrimitive.Backdrop className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md transition-opacity duration-200 ease-out data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
      <DialogPrimitive.Popup
        {...props}
        className={cn(
          'fixed top-4 left-1/2 z-[70] flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-2xl outline-none transition-[opacity,scale] duration-200 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 sm:top-[12dvh] sm:max-h-[76dvh] motion-reduce:transition-none',
          className,
        )}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}
