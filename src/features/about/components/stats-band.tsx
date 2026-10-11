import { aboutStatsContent } from '../constants/stats'
import { useCountUp } from '../hooks/use-count-up'

// Full-bleed primary to brand-dark gradient.
const bandClassName =
  'bg-[linear-gradient(90deg,var(--primary),var(--brand-dark))]'

function StatNumber({ target, suffix }: { target: number; suffix: string }) {
  const { ref, display } = useCountUp({ target })
  return (
    <dd
      ref={ref}
      className="order-1 shrink-0 text-3xl font-bold tracking-tight text-white tabular-nums sm:text-4xl lg:text-5xl"
    >
      {display}
      {suffix}
    </dd>
  )
}

export function AboutStatsBand() {
  return (
    <section aria-label="Ascentia in numbers" className={bandClassName}>
      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:flex lg:items-center lg:justify-center lg:gap-12">
          {aboutStatsContent.stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 lg:border-l lg:border-white/25 lg:pl-12 lg:first:border-0 lg:first:pl-0"
            >
              <dt className="order-2 min-w-0 max-w-40 flex-1 text-[10px] leading-snug font-medium tracking-[0.08em] break-words text-white/85 uppercase">
                {stat.label}
              </dt>
              <StatNumber target={stat.target} suffix={stat.suffix} />
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
