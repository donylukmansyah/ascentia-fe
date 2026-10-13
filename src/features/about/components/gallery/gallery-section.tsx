import { Reveal } from '#/components/ui/reveal'

import { aboutGalleryContent } from '../../constants/gallery'
import { Gallery, GalleryGrid, GalleryImage } from './gallery'

interface AboutGallerySectionProps {
  eyebrow?: string
  title?: string
  description?: string
}

export function AboutGallerySection({
  eyebrow = aboutGalleryContent.eyebrow,
  title = aboutGalleryContent.title,
  description = aboutGalleryContent.description,
}: AboutGallerySectionProps) {
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
            <p className="text-[10px] font-bold tracking-[0.12em] text-primary uppercase sm:text-[11px]">
              {eyebrow}
            </p>
            <h2
              id="about-gallery-heading"
              className="mt-2 text-[clamp(1.75rem,2.9vw,2.5rem)] leading-[1.04] font-bold tracking-[-0.045em] text-foreground"
            >
              {title}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed font-normal text-description-text sm:text-base lg:pb-2 lg:text-right">
            {description}
          </p>
        </Reveal>

        <div className="mt-10">
          <Reveal variant="up" delay={0.1}>
            <Gallery>
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
