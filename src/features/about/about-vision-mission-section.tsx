import { CircleArrow } from '#/components/ui/circle-arrow'
import { FlipCard } from '#/components/ui/flip-card'
import { MediaCard } from '#/components/ui/media-card'

import { aboutVisionMissionContent } from './about-vision-mission-data'

interface AboutVisionMissionSectionProps {
  visionTitle?: string
  visionDescription?: string
  missionTitle?: string
  missionDescription?: string
}

export function AboutVisionMissionSection({
  visionTitle = aboutVisionMissionContent.vision.title,
  visionDescription = aboutVisionMissionContent.vision.description,
  missionTitle = aboutVisionMissionContent.mission.title,
  missionDescription = aboutVisionMissionContent.mission.description,
}: AboutVisionMissionSectionProps) {
  return (
    <section
      aria-label="Vision and mission"
      className="bg-muted py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto grid w-full max-w-7xl items-stretch gap-5 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">
        <FlipCard
          label="Flip vision card"
          front={
            <MediaCard
              image={aboutVisionMissionContent.vision.image.src}
              imageAlt={aboutVisionMissionContent.vision.image.alt}
              title={visionTitle}
              description={visionDescription}
              action={<CircleArrow />}
              className="h-full"
            />
          }
          back={
            <article className="relative isolate flex min-h-[420px] overflow-hidden rounded-3xl bg-[var(--brand-dark)] text-white sm:min-h-[480px]">
              <div
                className="hero-carousel__noise pointer-events-none absolute inset-0 -z-10 !opacity-[0.28] mix-blend-overlay"
                aria-hidden="true"
              />
              <p className="absolute top-6 right-6 text-6xl font-bold tracking-[-0.08em] text-white/10 sm:top-8 sm:right-8 sm:text-8xl">
                01
              </p>
              <div className="flex flex-1 flex-col justify-end p-6 sm:p-8">
                <p className="text-[10px] font-bold tracking-[0.12em] text-white/70 uppercase sm:text-[11px]">
                  Our vision
                </p>
                <h3 className="mt-2 text-2xl font-medium tracking-[0.25em] text-white uppercase sm:text-3xl">
                  {visionTitle}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed font-normal text-white/85 sm:text-base">
                  {aboutVisionMissionContent.vision.detail}
                </p>
              </div>
            </article>
          }
        />
        <FlipCard
          label="Flip mission card"
          front={
            <MediaCard
              image={aboutVisionMissionContent.mission.image.src}
              imageAlt={aboutVisionMissionContent.mission.image.alt}
              title={missionTitle}
              description={missionDescription}
              action={<CircleArrow />}
              className="h-full"
            />
          }
          back={
            <article className="relative isolate flex min-h-[420px] overflow-hidden rounded-3xl bg-primary text-white sm:min-h-[480px]">
              <div
                className="hero-carousel__noise pointer-events-none absolute inset-0 -z-10 !opacity-[0.28] mix-blend-overlay"
                aria-hidden="true"
              />
              <p className="absolute top-6 right-6 text-6xl font-bold tracking-[-0.08em] text-white/10 sm:top-8 sm:right-8 sm:text-8xl">
                02
              </p>
              <div className="flex flex-1 flex-col justify-end p-6 sm:p-8">
                <p className="text-[10px] font-bold tracking-[0.12em] text-white/70 uppercase sm:text-[11px]">
                  Our mission
                </p>
                <h3 className="mt-2 text-2xl font-medium tracking-[0.25em] text-white uppercase sm:text-3xl">
                  {missionTitle}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-relaxed font-normal text-white/85 sm:text-base">
                  {aboutVisionMissionContent.mission.detail}
                </p>
              </div>
            </article>
          }
        />
      </div>
    </section>
  )
}
