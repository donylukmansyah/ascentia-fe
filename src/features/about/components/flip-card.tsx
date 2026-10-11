import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'

import { cn } from 'cn'

interface FlipCardProps {
  front: ReactNode
  back: ReactNode
  label: string
  defaultFlipped?: boolean
  flipped?: boolean
  onFlippedChange?: (flipped: boolean) => void
  className?: string
}

function mapRange(
  value: number,
  minA: number,
  maxA: number,
  minB: number,
  maxB: number,
) {
  return minB + ((value - minA) * (maxB - minB)) / (maxA - minA)
}

export function FlipCard({
  front,
  back,
  label,
  defaultFlipped = false,
  flipped,
  onFlippedChange,
  className,
}: FlipCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(defaultFlipped)
  const cardRef = useRef<HTMLDivElement>(null)
  const frontRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLDivElement>(null)
  const pointerPositionRef = useRef<{ x: number; y: number } | null>(null)
  const isPointerInsideRef = useRef(false)
  const isControlled = flipped !== undefined
  const showBack = isControlled ? flipped : internalFlipped

  const resetTilt = useCallback(() => {
    if (frontRef.current)
      frontRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)'
    if (backRef.current) backRef.current.style.transform = 'rotateY(180deg)'
  }, [])

  const applyTilt = useCallback(
    (clientX: number, clientY: number, targetFlipped = showBack) => {
      const card = cardRef.current
      const activeSide = targetFlipped ? backRef.current : frontRef.current
      if (!card || !activeSide) return

      const rect = card.getBoundingClientRect()
      const rotateY = mapRange(clientX - rect.left, 0, rect.width, -15, 15)
      const rotateX = mapRange(clientY - rect.top, 0, rect.height, 15, -15)

      activeSide.style.transform = targetFlipped
        ? `rotateY(180deg) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
        : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    },
    [showBack],
  )

  useEffect(() => {
    const pointerPosition = pointerPositionRef.current
    if (!isPointerInsideRef.current || !pointerPosition) {
      resetTilt()
      return
    }

    const animationFrame = requestAnimationFrame(() => {
      applyTilt(pointerPosition.x, pointerPosition.y, showBack)
    })

    return () => cancelAnimationFrame(animationFrame)
  }, [applyTilt, resetTilt, showBack])

  const updateFlipped = (next: boolean) => {
    if (!isControlled) setInternalFlipped(next)
    onFlippedChange?.(next)
  }

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    pointerPositionRef.current = { x: event.clientX, y: event.clientY }
    updateFlipped(!showBack)
  }

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    pointerPositionRef.current = { x: event.clientX, y: event.clientY }
    isPointerInsideRef.current = true
    applyTilt(event.clientX, event.clientY)
  }

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    pointerPositionRef.current = { x: event.clientX, y: event.clientY }
    isPointerInsideRef.current = true
    applyTilt(event.clientX, event.clientY)
  }

  const handleMouseLeave = () => {
    isPointerInsideRef.current = false
    pointerPositionRef.current = null
    resetTilt()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    updateFlipped(!showBack)
  }

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-pressed={showBack}
      aria-label={label}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'h-full cursor-pointer [perspective:1000px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary',
        className,
      )}
    >
      <div
        className={cn(
          'grid h-full transition-transform duration-500 ease-in-out [transform-style:preserve-3d] motion-reduce:transition-none',
          showBack && '[transform:rotateY(180deg)]',
        )}
      >
        <div
          ref={frontRef}
          className="transition-[transform,filter] duration-[250ms] ease-out [backface-visibility:hidden] [grid-area:1/1] motion-reduce:transition-none"
        >
          {front}
        </div>
        <div
          ref={backRef}
          className="transition-[transform,filter] duration-[250ms] ease-out [backface-visibility:hidden] [grid-area:1/1] [transform:rotateY(180deg)] motion-reduce:transition-none"
        >
          {back}
        </div>
      </div>
    </div>
  )
}
