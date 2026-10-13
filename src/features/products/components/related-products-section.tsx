import { Link } from '@tanstack/react-router'

import { allProducts } from '../constants/products'
import type { ProductDetailData } from '../types/product'
import { ProductCard } from './product-card'
import { ArrowUpRight } from 'lucide-react'

interface RelatedProductsSectionProps {
  product: ProductDetailData
}

export function RelatedProductsSection({
  product,
}: RelatedProductsSectionProps) {
  const related = product.relatedProductSlugs
    .map((slug) => allProducts.find((item) => item.slug === slug))
    .filter((item): item is (typeof allProducts)[number] => Boolean(item))
    .slice(0, 4)

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
            <ArrowUpRight size={"10px"}/>
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 lg:grid-cols-4">
          {related.map((relatedProduct) => (
            <li key={relatedProduct.id} className="min-w-0">
              <ProductCard product={relatedProduct} className="h-full" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
