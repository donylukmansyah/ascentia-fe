import { useQuery } from '@tanstack/react-query'

import { Button } from '#/components/ui/button'
import {
  featuredProductsQueryOptions,
  productTaxonomiesQueryOptions,
} from '#/features/products/api/product-queries'
import { ContactPanel } from '#/features/contact/components/contact-panel'
import { ProductCarouselSection } from '#/features/products/components/product-carousel-section'
import { useLanguage } from '#/lib/i18n'

import { BrandMarquee } from '../components/brand-marquee'
import { HeroSection } from '../components/hero-section'
import { WhoWeAreSection } from '../components/who-we-are-section'

export function HomePage() {
  const { t } = useLanguage()
  const taxonomies = useQuery(productTaxonomiesQueryOptions())
  const featured = useQuery(featuredProductsQueryOptions())

  return (
    <>
      <HeroSection />
      <BrandMarquee brands={taxonomies.data?.brands ?? []} />
      {taxonomies.isPending && (
        <p
          role="status"
          className="mx-auto max-w-7xl px-5 py-4 text-sm text-description-text sm:px-8 lg:px-12"
        >
          {t('home.brands.loading', 'Loading brands…')}
        </p>
      )}
      {taxonomies.isError && (
        <div
          role="alert"
          className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-4 text-sm sm:px-8 lg:px-12"
        >
          <p>{t('home.brands.error', 'Unable to load brands.')}</p>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => void taxonomies.refetch()}
          >
            {t('common.tryAgain', 'Try again')}
          </Button>
        </div>
      )}
      <WhoWeAreSection />
      <ProductCarouselSection
        products={featured.data?.items ?? []}
        pending={featured.isPending}
        error={featured.isError}
        retry={() => void featured.refetch()}
        kicker={t('home.featured.kicker', 'Products')}
        title={t('home.featured.title', 'Featured products')}
        description={t(
          'home.featured.description',
          'A focused selection of analytical instruments for sample preparation and reliable laboratory results.',
        )}
        ctaTo="/products"
        ctaLabel={t('home.featured.cta', 'View all products')}
      />
      <ContactPanel className="bg-[#F7F9FC] py-16 sm:py-20 lg:py-24" />
    </>
  )
}
