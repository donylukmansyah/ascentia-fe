import { CtaLink } from '#/components/ui/cta-link'
import { PageStatus } from '#/components/ui/page-status'
import { useLanguage } from '#/lib/i18n'

export function NotFoundPage() {
  const { t } = useLanguage()
  return (
    <PageStatus
      headingId="not-found-heading"
      visual={
        <div
          aria-hidden="true"
          className="flex items-end justify-center text-[clamp(7rem,25vw,14rem)] leading-none font-bold tracking-tight text-primary"
        >
          <span>40</span>
          <span className="relative">
            4
            <img
              src="/maskot/maskot.webp"
              alt=""
              width={2171}
              height={2171}
              className="absolute bottom-0 left-[10%] h-auto w-[1em] max-w-none"
            />
          </span>
        </div>
      }
      title={t('ui.pageNotFound', 'Page not found')}
      description={t(
        'ui.pageMissing',
        'The page may have moved, or the address may be incorrect.',
      )}
    >
      <CtaLink to="/">{t('ui.backHome', 'Back to home')}</CtaLink>
    </PageStatus>
  )
}
