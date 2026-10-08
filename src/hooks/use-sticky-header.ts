import { useEffect, useState } from 'react'

export type HeaderVisibility =
  | 'transparent'
  | 'visible'
  | 'hidden'
  | 'hidden-initial'

// Require sustained upward travel so short mobile scroll corrections don't reveal the header.
const UPWARD_REVEAL_THRESHOLD = 32

type UseStickyHeaderOptions = {
  topOffset?: number
  hideOffset?: number
  tolerance?: number
}

export function useStickyHeader(
  options: UseStickyHeaderOptions = {},
): HeaderVisibility {
  const { topOffset = 12, hideOffset = 320, tolerance = 8 } = options
  const [visibility, setVisibility] = useState<HeaderVisibility>('transparent')

  useEffect(() => {
    let previousScrollY = window.scrollY
    let previousDirection = 0
    let directionDistance = 0
    let animationFrame: number | undefined
    let hasRevealedAfterScroll = false

    const update = () => {
      animationFrame = undefined

      const currentScrollY = Math.max(window.scrollY, 0)
      const diff = currentScrollY - previousScrollY
      previousScrollY = currentScrollY

      if (currentScrollY <= topOffset) {
        previousDirection = 0
        directionDistance = 0
        hasRevealedAfterScroll = false
        setVisibility('transparent')
        return
      }

      if (diff === 0) {
        return
      }

      const direction = Math.sign(diff)

      if (direction !== previousDirection) {
        directionDistance = 0
      }

      directionDistance += Math.abs(diff)
      previousDirection = direction

      if (directionDistance < tolerance) {
        return
      }

      if (direction < 0) {
        if (directionDistance >= UPWARD_REVEAL_THRESHOLD) {
          hasRevealedAfterScroll = true
          setVisibility('visible')
        }
      } else {
        setVisibility(hasRevealedAfterScroll ? 'hidden' : 'hidden-initial')
      }
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
