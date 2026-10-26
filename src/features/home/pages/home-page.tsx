import { useQuery } from '@tanstack/react-query'

import { featuredProductsQueryOptions } from '#/features/products/api/product-queries'
import { ContactPanel } from '#/features/contact/components/contact-panel'
import { ProductCarouselSection } from '#/features/products/components/product-carousel-section'
import { useLanguage } from '#/lib/i18n'

import { BrandMarquee } from '../components/brand-marquee'
import { HeroSection } from '../components/hero-section'
import { WhoWeAreSection } from '../components/who-we-are-section'

export function HomePage() {
  const { t } = useLanguage()
  const featured = useQuery(featuredProductsQueryOptions())

  return (
    <>
      <HeroSection />
      <BrandMarquee />
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
