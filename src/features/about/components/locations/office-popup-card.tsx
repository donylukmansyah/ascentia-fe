import { motion, useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'

import { CtaLink } from '#/components/ui/cta-link'

import type { OfficeLocation } from '../../constants/locations'

// Stagger mirrors the social dock pop sequence.
const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.06 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 420, damping: 26 },
  },
}

export function OfficePopupCard({ office }: { office: OfficeLocation }) {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <motion.div
      className="w-[min(300px,82vw)] max-w-full select-none"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'tween', duration: 0.2, ease: 'easeOut' }
      }
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        <motion.div
          variants={list}
          initial={reduceMotion ? false : 'hidden'}
          animate="show"
        >
          <motion.div variants={item} className="relative px-3 pt-3">
            <img
              src={office.photo}
              alt={office.name}
              loading="lazy"
              decoding="async"
              className="h-24 w-full rounded-xl object-cover"
            />
            <span className="absolute top-5 right-5 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase shadow-sm backdrop-blur">
              <span className="size-1.5 rounded-full bg-primary" />
              {office.label}
            </span>
          </motion.div>

          <div className="flex flex-col gap-2 p-4">
            <div className="space-y-1">
              <motion.div variants={item}>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  {office.name}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <MapPin
                    className="mr-1 inline size-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {office.address}
                </p>
              </motion.div>

              <div className="grid gap-1 pt-1 text-xs">
                <motion.a
                  variants={item}
                  href={`mailto:${office.email}`}
                  className="inline-flex cursor-pointer items-center gap-2 hover:text-primary"
                >
                  <Mail className="size-3.5 text-primary" aria-hidden="true" />
                  {office.email}
                </motion.a>
                <motion.a
                  variants={item}
                  href={office.phoneHref}
                  className="inline-flex cursor-pointer items-center gap-2 hover:text-primary"
                >
                  <Phone className="size-3.5 text-primary" aria-hidden="true" />
                  {office.phone}
                </motion.a>
                <motion.a
                  variants={item}
                  href={office.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex cursor-pointer items-center gap-2 hover:text-primary"
                >
                  <MessageCircle
                    className="size-3.5 text-primary"
                    aria-hidden="true"
                  />
                  {office.whatsapp}
                </motion.a>
                <motion.div variants={item}>
                  <CtaLink
                    to={office.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 w-full"
                  >
                    Open in Google Maps
                  </CtaLink>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
