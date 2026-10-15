import { Link } from '@tanstack/react-router'

import { Reveal } from '#/components/ui/reveal'

import type { ProductCardData } from '../types/product'
import { ProductCard } from './product-card'
import { ArrowUpRight } from 'lucide-react'

interface RelatedProductsSectionProps {
  products: ProductCardData[]
}

export function RelatedProductsLoading() {
  return (
    <section
      aria-label="Loading related products"
      aria-busy="true"
      role="status"
      className="border-t border-border bg-background py-14 sm:py-18 lg:py-20"
    >
      <span className="sr-only">Loading related products…</span>
      <div
        aria-hidden="true"
        className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12"
      >
        <div className="flex items-end justify-between gap-5">
          <div className="h-10 w-64 max-w-[70%] animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        </div>
        <ul className="mt-8 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <li key={index} className="min-w-0 border border-border p-4">
              <div className="aspect-square animate-pulse bg-muted motion-reduce:animate-none" />
              <div className="mt-5 h-3 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              <div className="mt-3 h-10 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              <div className="mt-5 h-4 w-28 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function RelatedProductsSection({
  products: related,
}: RelatedProductsSectionProps) {
  if (related.length === 0) return null

  return (
    <section
      id="related-products"
      aria-labelledby="related-products-heading"
      className="scroll-mt-16 border-t border-border bg-background py-14 sm:py-18 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex items-end justify-between gap-5">
          <h2
            id="related-products-heading"
            className="text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.04] font-bold tracking-[-0.045em] text-foreground"
          >
            Related Products
          </h2>
          <Link
            to="/products"
            className="cursor-pointer text-xs font-bold text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary flex gap-2 items-center"
          >
            View all
            <ArrowUpRight size={10} />
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 lg:grid-cols-4">
          {related.map((relatedProduct, index) => (
            <li key={relatedProduct.id} className="min-w-0">
              <Reveal
                variant="up"
                delay={(index % 4) * 0.08}
                className="h-full"
              >
                <ProductCard product={relatedProduct} className="h-full" />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
