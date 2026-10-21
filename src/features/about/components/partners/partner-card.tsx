import { cn } from 'cn'

import { useLanguage } from '#/lib/i18n'

import type { AboutPartner } from '../../constants/partners'
import { CircleArrow } from '../circle-arrow'

interface AboutPartnerCardProps {
  partner: AboutPartner
  active?: boolean
  onSelect?: () => void
  className?: string
  tabIndex?: number
}

export function AboutPartnerCard({
  partner,
  active = false,
  onSelect,
  className,
  tabIndex,
}: AboutPartnerCardProps) {
  const { t } = useLanguage()
  const description = t(
    `about.partners.items.${partner.id}`,
    partner.description,
  )
  const detailsLabel = t(
    'about.partners.showDetails',
    'Show {name} details',
  ).replace('{name}', partner.name)

  return (
    <button
      type="button"
      onClick={onSelect}
      tabIndex={tabIndex}
      aria-pressed={active}
      aria-label={detailsLabel}
      className={cn(
        'group relative flex min-h-[320px] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-lg bg-white p-6 text-left text-foreground shadow-lg ring-1 ring-black/5 transition-[color,box-shadow] duration-300 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#288AC6] before:to-[#255DA2] before:opacity-0 before:transition-opacity before:duration-300 before:ease-out motion-reduce:before:transition-none sm:p-7 lg:min-h-[360px]',
        active &&
          'text-white shadow-[0_16px_30px_-18px_rgb(15_23_42/0.35)] ring-transparent before:opacity-100',
        className,
      )}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex h-7 shrink-0 items-center">
            <img
              src={partner.logo}
              alt={partner.logoAlt}
              loading="lazy"
              decoding="async"
              draggable={false}
              className={cn(
                'h-7 w-auto max-w-[140px] object-contain transition-opacity duration-200 ease-out',
                active && 'opacity-0',
              )}
            />
            <img
              src={partner.logoWhite}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              draggable={false}
              className={cn(
                'absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-200 ease-out',
                active && 'opacity-100',
              )}
            />
          </span>
          <span className="text-lg font-bold tracking-tight">
            {partner.name}
          </span>
        </div>
        <span
          aria-hidden="true"
          className={cn(
            'mt-4 block h-[2px] w-10 bg-accent transition-colors duration-300 ease-out',
            active && 'bg-white/60',
          )}
        />
        <p
          className={cn(
            'mt-4 text-sm leading-relaxed font-normal transition-colors duration-300 ease-out',
            active ? 'text-white/85' : 'text-description-text',
          )}
        >
          {description}
        </p>
      </div>
      <div className="relative z-10 mt-8 flex justify-end">
        <CircleArrow
          className={
            active
              ? undefined
              : 'border-foreground/30 bg-transparent text-foreground backdrop-blur-none'
          }
        />
      </div>
    </button>
  )
}
