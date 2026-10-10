import { CircleArrow } from '#/components/ui/circle-arrow'
import { cn } from 'cn'

import type { AboutPartner } from './about-partners-data'

interface AboutPartnerCardProps {
  partner: AboutPartner
  active?: boolean
  onSelect?: () => void
  className?: string
}

export function AboutPartnerCard({
  partner,
  active = false,
  onSelect,
  className,
}: AboutPartnerCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`Show ${partner.name} details`}
      className={cn(
        'flex min-h-[380px] w-full cursor-pointer flex-col justify-between rounded-[20px] p-6 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:min-h-[420px] sm:p-8',
        active
          ? 'bg-gradient-to-br from-[#288AC6] to-[#255DA2] text-white shadow-[0_18px_40px_-20px_rgb(37_93_162/0.55)]'
          : 'border border-border/60 bg-white text-foreground shadow-[0_2px_8px_-6px_rgb(0_0_0/0.12)]',
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
            className="h-8 w-auto object-contain"
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
