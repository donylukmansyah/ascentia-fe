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
  // Triple items ensure track width fills ultrawide displays before looping
  const items = [...categories, ...categories, ...categories]

  return (
    <nav
      aria-label="Product categories ticker"
      className={`group relative overflow-hidden bg-accent py-3.5 text-white shadow-inner sm:py-4 ${className}`}
    >
      <div
        tabIndex={0}
        role="region"
        aria-label="Category marquee"
        className="flex w-max motion-reduce:transform-none"
      >
        <div className="flex shrink-0 items-center [animation:brand-marquee-scroll_32s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:[animation:none]">
          {items.map((cat, idx) => (
            <div
              key={`cat-a-${idx}`}
              className="flex shrink-0 items-center gap-3 pr-3 text-xs font-semibold tracking-wider text-white uppercase sm:gap-4 sm:pr-4 sm:text-sm"
            >
              <span>{cat}</span>
              <span
                className="size-1.5 shrink-0 rounded-full bg-white/75"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>

        <div
          aria-hidden="true"
          className="flex shrink-0 items-center [animation:brand-marquee-scroll_32s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:[animation:none]"
        >
          {items.map((cat, idx) => (
            <div
              key={`cat-b-${idx}`}
              className="flex shrink-0 items-center gap-3 pr-3 text-xs font-semibold tracking-wider text-white uppercase sm:gap-4 sm:pr-4 sm:text-sm"
            >
              <span>{cat}</span>
              <span
                className="size-1.5 shrink-0 rounded-full bg-white/75"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
