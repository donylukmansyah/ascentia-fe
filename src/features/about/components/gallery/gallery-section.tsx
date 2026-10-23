import { Reveal } from '#/components/ui/reveal'
import { useLanguage } from '#/lib/i18n'

import { aboutGalleryContent } from '../../constants/gallery'
import { Gallery, GalleryGrid, GalleryImage } from './gallery'

interface AboutGallerySectionProps {
  eyebrow?: string
  title?: string
  description?: string
}

export function AboutGallerySection({
  eyebrow,
  title,
  description,
}: AboutGallerySectionProps) {
  const { t } = useLanguage()
  const resolvedEyebrow =
    eyebrow ?? t('about.gallery.eyebrow', aboutGalleryContent.eyebrow)
  const resolvedTitle =
    title ?? t('about.gallery.title', aboutGalleryContent.title)
  const resolvedDescription =
    description ??
    t('about.gallery.description', aboutGalleryContent.description)

  return (
    <section
      aria-labelledby="about-gallery-heading"
      className="bg-background py-14 sm:py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal
          variant="up"
          className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <p className="section-kicker">{resolvedEyebrow}</p>
            <h2 id="about-gallery-heading" className="section-title mt-2">
              {resolvedTitle}
            </h2>
          </div>
          <p className="section-description max-w-md lg:pb-2 lg:text-right">
            {resolvedDescription}
          </p>
        </Reveal>

        <div className="mt-10">
          <Reveal variant="up" delay={0.1}>
            <Gallery photos={aboutGalleryContent.photos}>
              <GalleryGrid>
                {aboutGalleryContent.photos.map((photo) => (
                  <GalleryImage key={photo.id} photo={photo} />
                ))}
              </GalleryGrid>
            </Gallery>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
