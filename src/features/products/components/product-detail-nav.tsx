import { useStickyHeader } from '#/hooks/use-sticky-header'
import { cn } from '#/lib/utils'

export type ProductDetailTab = 'description' | 'specifications'

// Header h-20, lg:h-24. Nav docks below it when shown, top when hidden.

interface ProductDetailNavProps {
  onTabChange: (tab: ProductDetailTab) => void
}

const sections: Array<{
  id: string
  label: string
  tab?: ProductDetailTab
}> = [
  { id: 'product', label: 'Products' },
  { id: 'description', label: 'Descriptions', tab: 'description' },
  { id: 'specifications', label: 'Specifications', tab: 'specifications' },
  { id: 'related-products', label: 'Related products' },
]

export function ProductDetailNav({ onTabChange }: ProductDetailNavProps) {
  const mode = useStickyHeader({ hideOffset: 320 })
  const headerPinned = mode !== 'hidden' && mode !== 'hidden-initial'
  const handleNavigation = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
    tab?: ProductDetailTab,
  ) => {
    const target = document.getElementById(id)
    if (!target) return

    event.preventDefault()
    tab && onTabChange(tab)
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    })
    window.history.replaceState(null, '', `#${id}`)
  }

  return (
    <nav
      aria-label="Product detail sections"
      className={cn(
        'sticky z-30 border-y border-border bg-background/95 backdrop-blur transition-[top] duration-300',
        headerPinned ? 'top-20 lg:top-24' : 'top-0',
      )}
    >
      <div className="mx-auto max-w-7xl overflow-x-auto px-5 sm:px-8 lg:px-12">
        <ul className="flex min-w-max items-center gap-7 sm:gap-10">
          {sections.map(({ id, label, tab }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(event) => handleNavigation(event, id, tab)}
                className="inline-flex cursor-pointer py-4 text-[10px] font-bold tracking-[-0.01em] text-foreground/65 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-primary sm:py-5 sm:text-xs"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
