import { useLanguage } from '#/lib/i18n'

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

export function CategoryNav({ categories, className = '' }: CategoryNavProps) {
  const { t, tArray } = useLanguage()
  const activeCategories =
    categories ?? tArray('home.categories', defaultCategories)
  const items = [...activeCategories, ...activeCategories, ...activeCategories]

  return (
    <nav
      aria-label={t('home.categoriesTicker', 'Product categories ticker')}
      className={`group relative overflow-hidden bg-accent py-4.5 text-white sm:py-5.5 ${className}`}
    >
      <div
        tabIndex={0}
        role="region"
        aria-label={t('home.categoriesMarquee', 'Category marquee')}
        className="flex w-max motion-reduce:transform-none"
      >
        <div className="flex shrink-0 items-center [animation:brand-marquee-scroll_28s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:[animation:none]">
          {items.map((cat, idx) => (
            <div
              key={`cat-a-${idx}`}
              className="flex shrink-0 items-center gap-3 pr-3 text-[11px] font-bold tracking-wider uppercase sm:gap-4 sm:pr-4 sm:text-xs"
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
              className="flex shrink-0 items-center gap-3 pr-3 text-[11px] font-bold tracking-wider uppercase sm:gap-4 sm:pr-4 sm:text-xs"
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
