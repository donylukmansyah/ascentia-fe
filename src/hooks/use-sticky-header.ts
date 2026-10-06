import { useEffect, useState } from 'react'

export type HeaderVisibility = 'transparent' | 'visible' | 'hidden'

type UseStickyHeaderOptions = {
  topOffset?: number
  hideOffset?: number
  tolerance?: number
}

export function useStickyHeader(
  options: UseStickyHeaderOptions = {},
): HeaderVisibility {
  const { topOffset = 12, hideOffset = 320, tolerance = 8 } = options
  const [visibility, setVisibility] =
    useState<HeaderVisibility>('transparent')

  useEffect(() => {
    let previousScrollY = window.scrollY
    let animationFrame: number | undefined

    const update = () => {
      animationFrame = undefined

      const currentScrollY = Math.max(window.scrollY, 0)
      const diff = currentScrollY - previousScrollY

      if (Math.abs(diff) < tolerance) {
        return
      }

      if (currentScrollY <= topOffset) {
        setVisibility('transparent')
      } else if (diff < 0) {
        setVisibility('visible')
      } else if (currentScrollY < hideOffset) {
        setVisibility('transparent')
      } else {
        setVisibility('hidden')
      }

      previousScrollY = currentScrollY
    }

    const handleScroll = () => {
      if (animationFrame === undefined) {
        animationFrame = window.requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', handleScroll)

      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame)
      }
    }
  }, [topOffset, hideOffset, tolerance])

  return visibility
}
