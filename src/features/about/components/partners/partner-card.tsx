import { cn } from 'cn'

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
  return (
    <button
      type="button"
      onClick={onSelect}
      tabIndex={tabIndex}
      aria-pressed={active}
      aria-label={`Show ${partner.name} details`}
      className={cn(
        'flex min-h-[320px] w-full cursor-pointer flex-col justify-between rounded-lg p-6 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:p-7 lg:min-h-[360px]',
        active
          ? 'bg-gradient-to-br from-[#288AC6] to-[#255DA2] text-white shadow-[0_16px_30px_-18px_rgb(15_23_42/0.35)]'
          : 'border border-black/5 bg-white text-foreground shadow-lg',
        className,
      )}
    >
      <div>
        <div className="flex items-center gap-3">
          <img
            src={active ? partner.logoWhite : partner.logo}
            alt={partner.logoAlt}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="h-7 w-auto object-contain"
          />
          <span className="text-lg font-bold tracking-tight">
            {partner.name}
          </span>
        </div>
        <span
          aria-hidden="true"
          className={cn(
            'mt-4 block h-[2px] w-10',
            active ? 'bg-white/60' : 'bg-accent',
          )}
        />
        <p
          className={cn(
            'mt-4 text-sm leading-relaxed font-normal',
            active ? 'text-white/85' : 'text-description-text',
          )}
        >
          {partner.description}
        </p>
      </div>
      <div className="mt-8 flex justify-end">
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
