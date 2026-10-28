import { useLayoutEffect, useState } from 'react'
import { flushSync } from 'react-dom'

export type HeaderVisibility =
  'transparent' | 'visible' | 'hidden' | 'hidden-initial'

// Need sustained upward scroll to reveal.
const UPWARD_REVEAL_THRESHOLD = 32

type UseStickyHeaderOptions = {
  topOffset?: number
  tolerance?: number
  // Pause keeps visibility (dropdown open).
  paused?: boolean
  // Never hide; stay visible so a sub-nav can't chase it.
  disableHide?: boolean
}

export function useStickyHeader(
  options: UseStickyHeaderOptions = {},
): HeaderVisibility {
  const {
    topOffset = 12,
    tolerance = 8,
    paused = false,
    disableHide = false,
  } = options
  const [visibility, setVisibility] = useState<HeaderVisibility>('transparent')

  useLayoutEffect(() => {
    if (paused) return

    setVisibility((current) =>
      window.scrollY <= topOffset
        ? 'transparent'
        : disableHide
          ? 'visible'
          : current === 'transparent'
            ? 'hidden-initial'
            : current,
    )
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
        setVisibility(
          disableHide
            ? 'visible'
            : hasRevealedAfterScroll
              ? 'hidden'
              : 'hidden-initial',
        )
      }
    }

    const handleScroll = () => {
      if (window.scrollY <= topOffset) {
        if (animationFrame !== undefined) {
          window.cancelAnimationFrame(animationFrame)
        }
        // Router scroll restoration must settle before paint.
        flushSync(update)
      } else if (animationFrame === undefined) {
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
  }, [topOffset, tolerance, paused, disableHide])

  return visibility
}
