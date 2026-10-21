import { useEffect, useState } from 'react'

import { LogoLoader } from '#/components/ui/logo-loader'
import { cn } from '#/lib/utils'
import type { LanguageCode } from '#/lib/i18n/types'
import logoMark from '../../../public/brand/logo-mark.png?inline'

interface LanguageTransitionOverlayProps {
  active: boolean
  targetLang: LanguageCode | null
}

export function LanguageTransitionOverlay({
  active,
  targetLang,
}: LanguageTransitionOverlayProps) {
  const [rendered, setRendered] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (active) {
      setRendered(true)
      // Tick ensures element mounted before fade begins.
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }

    setVisible(false)
    // Delay unmount until fade-out transition completes.
    const timer = setTimeout(() => {
      setRendered(false)
    }, 280)

    return () => clearTimeout(timer)
  }, [active])

  if (!rendered) return null

  const label =
    targetLang === 'id'
      ? 'Menyiapkan Bahasa Indonesia…'
      : 'Switching to English…'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={active}
      className={cn(
        'fixed inset-0 z-[120] flex items-center justify-center bg-background/95 backdrop-blur-xs transition-opacity duration-250 ease-out',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      <LogoLoader src={logoMark} label={label} />
    </div>
  )
}
