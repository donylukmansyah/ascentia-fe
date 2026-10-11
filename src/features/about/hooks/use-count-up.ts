import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import type { AnimationPlaybackControls } from 'motion/react'

type UseCountUpOptions = {
  target: number
  delay?: number
}

const SCRAMBLE_MS = 300
const COUNT_MS = 1200

function randomDigits(length: number) {
  let digits = ''
  for (let i = 0; i < length; i++) {
    digits += String(Math.floor(Math.random() * 10))
  }
  return digits
}

// Scrambles digits in view, then counts up to target.
export function useCountUp({ target, delay = 0 }: UseCountUpOptions) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, {
    once: true,
    margin: '0px 0px -120px 0px',
  })
  const reduceMotion = useReducedMotion() ?? false
  const [display, setDisplay] = useState('0')
  const controlsRef = useRef<AnimationPlaybackControls | null>(null)

  useEffect(() => {
    if (!inView) return
    if (reduceMotion) {
      setDisplay(String(target))
      return
    }
    const length = String(target).length
    const scramble = window.setInterval(() => {
      setDisplay(randomDigits(length))
    }, 50)
    // Count starts after scramble so frames never clash.
    const startCount = window.setTimeout(
      () => {
        window.clearInterval(scramble)
        controlsRef.current = animate(0, target, {
          duration: COUNT_MS / 1000,
          ease: [0.22, 1, 0.36, 1],
          onUpdate: (value) => setDisplay(String(Math.round(value))),
        })
      },
      SCRAMBLE_MS + delay * 1000,
    )
    return () => {
      window.clearInterval(scramble)
      window.clearTimeout(startCount)
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [delay, inView, reduceMotion, target])

  return { ref, display }
}
