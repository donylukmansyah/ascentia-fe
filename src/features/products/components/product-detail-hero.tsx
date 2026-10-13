import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

import { Breadcrumb } from '#/components/ui/breadcrumb'
import type { ProductDetailData } from '../types/product'

interface ProductDetailHeroProps {
  product: ProductDetailData
}

export function ProductDetailHero({ product }: ProductDetailHeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], [-42, 42])
  const heroImage = product.heroImage ?? product.image

  return (
    <section
      ref={sectionRef}
      aria-labelledby="product-detail-heading"
      className="relative isolate flex min-h-[390px] overflow-hidden bg-foreground text-white sm:min-h-[440px] lg:min-h-[516px]"
    >
      {heroImage ? (
        <motion.img
          src={heroImage}
          alt=""
          aria-hidden="true"
          decoding="async"
          draggable={false}
          style={{ y: reduceMotion ? 0 : imageY }}
          className="pointer-events-none absolute -right-[8%] bottom-[-4%] -z-20 h-[88%] w-[72%] object-contain object-right opacity-30 sm:right-[2%] sm:w-[58%] lg:right-[7%] lg:h-[108%] lg:w-[51%] lg:opacity-35"
        />
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--foreground)_0%,color-mix(in_srgb,var(--foreground)_92%,transparent)_47%,color-mix(in_srgb,var(--foreground)_82%,transparent)_100%)]"
        aria-hidden="true"
      />

      <div className="mx-auto flex w-full max-w-7xl items-center px-5 pt-20 sm:px-8 sm:pt-24 lg:px-12 lg:pt-28">
        <div className="max-w-[min(100%,48rem)]">
          <Breadcrumb
            items={[
              { label: 'Home', to: '/' },
              { label: 'Products', to: '/products' },
              { label: product.brand },
              { label: product.name },
            ]}
            className="max-w-full overflow-hidden [&_ol]:whitespace-nowrap [&_ol]:text-[10px] sm:[&_ol]:text-xs"
          />
          <h1
            id="product-detail-heading"
            className="mt-7 line-clamp-2 text-[clamp(1.875rem,3.4vw,3.375rem)] leading-[1.03] font-bold tracking-[-0.045em] text-white break-words text-balance"
          >
            {product.name}
          </h1>
        </div>
      </div>
    </section>
  )
}
