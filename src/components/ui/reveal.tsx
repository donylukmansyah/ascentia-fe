import { motion, useReducedMotion } from 'motion/react'

import { cn } from 'cn'

type RevealVariant = 'up' | 'left' | 'right'

const offsets: Record<RevealVariant, { x: number; y: number }> = {
  // AOS fade distances are 100px per axis.
  up: { x: 0, y: 100 },
  left: { x: 100, y: 0 },
  right: { x: -100, y: 0 },
}

type RevealProps = {
  children: React.ReactNode
  className?: string
  variant?: RevealVariant
  delay?: number
}

// Scroll reveal matching the previous AOS setup.
export function Reveal({
  children,
  className,
  variant = 'up',
  delay = 0,
}: RevealProps) {
  const reduceMotion = useReducedMotion() ?? false
  const offset = offsets[variant]

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 'some', margin: '0px 0px -120px 0px' }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }
      }
    >
      {children}
    </motion.div>
  )
}
