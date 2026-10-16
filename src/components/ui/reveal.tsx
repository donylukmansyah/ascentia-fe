import { motion, useReducedMotion } from 'motion/react'

import { cn } from 'cn'

type RevealVariant = 'up' | 'left' | 'right'

type RevealProps = {
  children: React.ReactNode
  className?: string
  variant?: RevealVariant
  delay?: number
  distance?: number
  duration?: number
  margin?: string
}

// Scroll reveal matching previous AOS setup with custom offset.
export function Reveal({
  children,
  className,
  variant = 'up',
  delay = 0,
  distance = 100,
  duration = 0.6,
  margin = '0px 0px -120px 0px',
}: RevealProps) {
  const reduceMotion = useReducedMotion() ?? false
  const offset = {
    up: { x: 0, y: distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  }[variant]

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 'some', margin }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration, delay, ease: [0.25, 0.1, 0.25, 1] }
      }
    >
      {children}
    </motion.div>
  )
}
