import { useEffect, useRef, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'

import { trackPageView } from '../api/visitor-api'

export function useVisitorCounter() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const [views, setViews] = useState<number | null>(null)
  const lastPathname = useRef<string | null>(null)
  const requestId = useRef(0)

  useEffect(() => {
    const track = () => {
      if (lastPathname.current === pathname) return
      lastPathname.current = pathname
      const id = ++requestId.current

      trackPageView()
        .then((result) => {
          if (id !== requestId.current) return
          if (result.success && result.views >= 0) setViews(result.views)
        })
        .catch(() => undefined)
    }

    // Hidden or prerendered pages must not count as a view.
    if (document.visibilityState === 'visible') {
      track()
      return
    }

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      document.removeEventListener('visibilitychange', onVisible)
      track()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [pathname])

  return views
}
