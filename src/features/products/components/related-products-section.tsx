import { Link } from '@tanstack/react-router'

import { Reveal } from '#/components/ui/reveal'

import type { ProductCardData } from '../types/product'
import { ProductCard } from './product-card'

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
        <Reveal variant="up" distance={20} margin="0px 0px -40px 0px">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2
                id="related-products-heading"
                className="text-2xl font-bold tracking-tight text-[#1b1b36] sm:text-3xl"
              >
                Related Products
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                More instruments, equipment, and solutions from Ascentia
              </p>
            </div>
            <Link
              to="/products"
              className="cursor-pointer text-sm font-semibold text-primary hover:underline"
            >
              View all products →
            </Link>
          </div>
        </Reveal>
        <ul className="mt-8 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 lg:grid-cols-4">
          {related.map((relatedProduct, index) => (
            <li key={relatedProduct.id} className="min-w-0">
              <Reveal
                variant="up"
                distance={24}
                duration={0.45}
                margin="0px 0px -40px 0px"
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
