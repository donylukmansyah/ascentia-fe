import { useStickyHeader } from '#/hooks/use-sticky-header'
import { cn } from '#/lib/utils'

export type ProductDetailTab = 'description' | 'specifications'

interface ProductDetailNavProps {
  onTabChange: (tab: ProductDetailTab) => void
  hasSpecifications: boolean
  hasRelated: boolean
}

export function ProductDetailNav({ onTabChange, hasSpecifications, hasRelated }: ProductDetailNavProps) {
  const mode = useStickyHeader()
  const headerPinned = mode !== 'hidden' && mode !== 'hidden-initial'
  const sections: Array<{ id: string; label: string; tab?: ProductDetailTab }> = [
    { id: 'product', label: 'Product' },
    { id: 'description', label: 'Description', tab: 'description' },
    ...(hasSpecifications ? [{ id: 'specifications', label: 'Specifications', tab: 'specifications' as const }] : []),
    ...(hasRelated ? [{ id: 'related-products', label: 'Related products' }] : []),
  ]

  const handleNavigation = (id: string, tab?: ProductDetailTab) => {
    const target = document.getElementById(id)
    if (!target) return
    if (tab) onTabChange(tab)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Write hash after arriving; router snaps on writes.
    const writeHash = () => {
      const top = target.getBoundingClientRect().top + window.scrollY
      if (Math.abs(window.scrollY - top) < 160) {
        window.history.replaceState(null, '', `#${id}`)
      }
    }
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
      if (reduceMotion) {
        writeHash()
        return
      }
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        writeHash()
      }
      const fallback = window.setTimeout(() => {
        window.removeEventListener('scrollend', onScrollEnd)
        finish()
      }, 900)
      const onScrollEnd = () => {
        window.clearTimeout(fallback)
        finish()
      }
      window.addEventListener('scrollend', onScrollEnd, { once: true })
    })
  }

  return (
    <nav aria-label="Product detail sections" className={cn('sticky z-30 border-y border-border bg-background/95 backdrop-blur transition-[top] duration-300', headerPinned ? 'top-20 lg:top-24' : 'top-0')}>
      <div className="mx-auto max-w-7xl overflow-x-auto px-5 sm:px-8 lg:px-12"><ul className="flex min-w-max items-center gap-7 sm:gap-10">          {sections.map(({ id, label, tab }) => <li key={id}><button type="button" onClick={() => handleNavigation(id, tab)} className="inline-flex cursor-pointer py-4 text-[10px] font-bold tracking-[-0.01em] text-foreground/65 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-primary sm:py-5 sm:text-xs">{label}</button></li>)}</ul></div>
    </nav>
  )
}
