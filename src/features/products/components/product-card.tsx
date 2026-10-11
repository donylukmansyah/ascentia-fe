import type { ComponentProps } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Box } from 'lucide-react'

import { cn } from '#/lib/utils'
import type { ProductCardData } from '../types/product'

export interface ProductCardProps {
  product: ProductCardData
  to?: ComponentProps<typeof Link>['to']
  className?: string
}

export function ProductCard({
  product,
  to = '/products',
  className,
}: ProductCardProps) {
  return (
    <article
      aria-label={product.name}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[4px] border border-border bg-white transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-sm motion-reduce:hover:translate-none',
        className,
      )}
    >
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-[color-mix(in_srgb,var(--primary)_12%,white)] p-6 sm:p-7">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-[84%] w-[84%] object-contain transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground/60">
            <Box className="size-12 stroke-1" aria-hidden="true" />
            <span className="mt-2 text-xs font-medium uppercase tracking-wider">
              {product.brand}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <p className="text-[10px] font-extrabold tracking-[0.1em] text-primary uppercase sm:text-[11px]">
            {product.brand}
          </p>
          <h3 className="mt-2 text-base font-semibold leading-[1.15] tracking-[-0.025em] text-foreground transition-colors group-hover:text-primary">
            <Link
              to={to}
              className="before:absolute before:inset-0 focus-visible:outline-none"
            >
              {product.name}
            </Link>
          </h3>
        </div>

        <div className="mt-4 flex items-center gap-1 text-[11px] font-medium tracking-normal text-muted-foreground transition-colors group-hover:text-primary">
          <span>View Product</span>
          <ArrowUpRight
            className="size-3.5 text-primary transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  )
}
