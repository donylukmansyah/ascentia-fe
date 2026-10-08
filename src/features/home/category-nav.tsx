export const defaultCategories = [
  'Laboratory Equipment',
  'Analytical Instruments',
  'Sample Preparation',
  'Mineral Analysis',
  'XRF Technology',
  'Geochemical Standards',
]

interface CategoryNavProps {
  categories?: string[]
  className?: string
}

export function CategoryNav({
  categories = defaultCategories,
  className = '',
}: CategoryNavProps) {
  const items = [...categories, ...categories, ...categories]

  return (
    <nav
      aria-label="Product categories ticker"
      className={`group relative overflow-hidden bg-accent py-2.5 text-white sm:py-3 ${className}`}
    >
      <div
        tabIndex={0}
        role="region"
        aria-label="Category marquee"
        className="flex w-max motion-reduce:transform-none"
      >
        <div className="flex shrink-0 items-center [animation:brand-marquee-scroll_28s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:[animation:none]">
          {items.map((cat, idx) => (
            <div
              key={`cat-a-${idx}`}
              className="flex shrink-0 items-center gap-3 pr-3 text-[11px] font-bold tracking-wider text-white uppercase sm:gap-4 sm:pr-4 sm:text-xs"
            >
              <span>{cat}</span>
              <span
                className="size-1 shrink-0 rounded-full bg-white/80"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>

        <div
          aria-hidden="true"
          className="flex shrink-0 items-center [animation:brand-marquee-scroll_28s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:[animation:none]"
        >
          {items.map((cat, idx) => (
            <div
              key={`cat-b-${idx}`}
              className="flex shrink-0 items-center gap-3 pr-3 text-[11px] font-bold tracking-wider text-white uppercase sm:gap-4 sm:pr-4 sm:text-xs"
            >
              <span>{cat}</span>
              <span
                className="size-1 shrink-0 rounded-full bg-white/80"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
