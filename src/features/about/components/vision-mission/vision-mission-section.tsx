import { Reveal } from '#/components/ui/reveal'
import { useLanguage } from '#/lib/i18n'

import { aboutVisionMissionContent } from '../../constants/vision-mission'
import { CircleArrow } from '../circle-arrow'
import { FlipCard } from './flip-card'
import { MediaCard } from './media-card'

interface AboutVisionMissionSectionProps {
  visionTitle?: string
  visionDescription?: string
  missionTitle?: string
  missionDescription?: string
}

export function AboutVisionMissionSection({
  visionTitle,
  visionDescription,
  missionTitle,
  missionDescription,
}: AboutVisionMissionSectionProps) {
  const { t } = useLanguage()
  const resolvedVisionTitle =
    visionTitle ??
    t('about.visionMission.visionTitle', aboutVisionMissionContent.vision.title)
  const resolvedVisionDesc =
    visionDescription ??
    t(
      'about.visionMission.visionDesc',
      aboutVisionMissionContent.vision.description,
    )
  const resolvedVisionDetail = t(
    'about.visionMission.visionDetail',
    aboutVisionMissionContent.vision.detail,
  )
  const resolvedMissionTitle =
    missionTitle ??
    t(
      'about.visionMission.missionTitle',
      aboutVisionMissionContent.mission.title,
    )
  const resolvedMissionDesc =
    missionDescription ??
    t(
      'about.visionMission.missionDesc',
      aboutVisionMissionContent.mission.description,
    )
  const resolvedMissionDetail = t(
    'about.visionMission.missionDetail',
    aboutVisionMissionContent.mission.detail,
  )

  return (
    <section
      aria-label={t('about.visionMission.sectionLabel', 'Vision and mission')}
      className="bg-muted py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto grid w-full max-w-7xl items-stretch gap-5 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">
        <Reveal variant="up">
          <FlipCard
            label="Flip vision card"
            front={
              <MediaCard
                image={aboutVisionMissionContent.vision.image.src}
                imageAlt={aboutVisionMissionContent.vision.image.alt}
                title={resolvedVisionTitle}
                description={resolvedVisionDesc}
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
                    {resolvedVisionTitle}
                  </p>
                  <h3 className="mt-2 text-2xl font-medium tracking-[0.25em] text-white uppercase sm:text-3xl">
                    {resolvedVisionTitle}
                  </h3>
                  <p className="mt-4 max-w-md text-sm leading-relaxed font-normal text-white/85 sm:text-base">
                    {resolvedVisionDetail}
                  </p>
                </div>
              </article>
            }
          />
        </Reveal>
        <Reveal variant="up" delay={0.12}>
          <FlipCard
            label="Flip mission card"
            front={
              <MediaCard
                image={aboutVisionMissionContent.mission.image.src}
                imageAlt={aboutVisionMissionContent.mission.image.alt}
                title={resolvedMissionTitle}
                description={resolvedMissionDesc}
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
                    {resolvedMissionTitle}
                  </p>
                  <h3 className="mt-2 text-2xl font-medium tracking-[0.25em] text-white uppercase sm:text-3xl">
                    {resolvedMissionTitle}
                  </h3>
                  <p className="mt-4 max-w-md text-sm leading-relaxed font-normal text-white/85 sm:text-base">
                    {resolvedMissionDetail}
                  </p>
                </div>
              </article>
            }
          />
        </Reveal>
      </div>
    </section>
  )
}
