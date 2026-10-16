import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { isMacPlatform, isSearchShortcut } from '../search-shortcut'
import { SearchDialog } from './search-dialog'

interface SearchControls {
  open: boolean
  shortcut: string
  onOpen: () => void
}

export function GlobalSearch({
  children,
}: {
  children: (controls: SearchControls) => ReactNode
}) {
  const [open, setOpen] = useState(false)
  const returnFocus = useRef<HTMLElement | null>(null)

  const onOpen = useCallback(() => {
    returnFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    setOpen(true)
  }, [])

  useEffect(() => {
    const isMac = isMacPlatform(navigator.platform)
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const editable =
        target instanceof Element &&
        Boolean(
          target.closest(
            'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]',
          ),
        )
      if (!isSearchShortcut(event, isMac, editable) || event.defaultPrevented)
        return
      event.preventDefault()
      onOpen()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onOpen])

  return (
    <>
      {children({ open, shortcut: '⌘ K', onOpen })}
      <SearchDialog
        open={open}
        onOpenChange={setOpen}
        returnFocus={returnFocus}
      />
    </>
  )
}
