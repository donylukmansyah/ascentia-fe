import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ChevronDown, Loader2, Newspaper } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { EmptyState } from '#/components/ui/empty-state'
import { QueryErrorState } from '#/components/ui/query-error-state'
import { Reveal } from '#/components/ui/reveal'
import { useStickyHeader } from '#/hooks/use-sticky-header'
import { cn } from '#/lib/utils'
import { useLanguage } from '#/lib/i18n'

import { ArticleCard, ArticleMetadata } from './article-card'
import {
  featuredEventsQueryOptions,
  latestNewsQueryOptions,
  popularNewsQueryOptions,
  NEWS_LATEST_PAGE_SIZE,
} from '../api/article-queries'

// Skeleton mirrors ArticleCard layout per variant while fetching.
function ArticleCardSkeleton({
  variant = 'latest',
}: {
  variant?: 'featured' | 'compact' | 'brief' | 'latest'
}) {
  const horizontal = variant === 'compact' || variant === 'brief'
  const media =
    variant === 'brief'
      ? 'h-16 w-20 shrink-0'
      : variant === 'compact'
        ? 'h-24 w-20 shrink-0 sm:w-24 lg:w-20'
        : 'aspect-[16/10] w-full'
  const titleHeight =
    variant === 'featured' ? 'h-7' : variant === 'latest' ? 'h-5' : 'h-4'
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex min-w-0 animate-pulse motion-reduce:animate-none',
        horizontal ? 'items-start gap-3' : 'flex-col gap-4',
      )}
    >
      <div
        className={cn(
          'overflow-hidden rounded-[4px] bg-[color-mix(in_srgb,var(--primary)_8%,var(--muted))]',
          media,
        )}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className={cn('w-11/12 rounded bg-muted', titleHeight)} />
        <div className={cn('w-3/5 rounded bg-muted', titleHeight)} />
        {variant !== 'brief' && (
          <div className="mt-1 h-3.5 w-full rounded bg-muted" />
        )}
        <div className="mt-2 h-3 w-24 rounded bg-muted" />
      </div>
    </div>
  )
}

function FeaturedSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid items-start gap-8 md:grid-cols-2 lg:grid-cols-[minmax(0,40fr)_minmax(0,28fr)_minmax(0,32fr)] lg:gap-6"
    >
      <ArticleCardSkeleton variant="featured" />
      <div className="flex flex-col gap-6">
        {Array.from({ length: 2 }, (_, index) => (
          <ArticleCardSkeleton key={index} variant="compact" />
        ))}
      </div>
      <div className="divide-y divide-border md:col-span-2 md:grid md:grid-cols-2 md:gap-x-6 lg:col-span-1 lg:flex lg:flex-col">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="py-4 first:pt-0 last:pb-0">
            <ArticleCardSkeleton variant="brief" />
          </div>
        ))}
      </div>
    </div>
  )
}

function PopularSkeleton() {
  return (
    <ol aria-hidden="true" className="divide-y divide-border">
      {Array.from({ length: 4 }, (_, index) => (
        <li key={index} className="flex animate-pulse gap-4 py-5 first:pt-0">
          <div className="h-7 w-7 shrink-0 rounded bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-4/5 rounded bg-muted" />
            <div className="mt-1 h-3 w-24 rounded bg-muted" />
          </div>
        </li>
      ))}
    </ol>
  )
}

export function NewsContentSection() {
  const { t } = useLanguage()
  const [visibleCount, setVisibleCount] = useState(NEWS_LATEST_PAGE_SIZE)
  const headerMode = useStickyHeader()
  const headerPinned =
    headerMode !== 'hidden' && headerMode !== 'hidden-initial'

  const featuredQuery = useQuery(featuredEventsQueryOptions())
  const popularQuery = useQuery(popularNewsQueryOptions())
  const latestQuery = useQuery({
    ...latestNewsQueryOptions(1, visibleCount),
    placeholderData: keepPreviousData,
  })

  const featuredData = featuredQuery.data
  const popularArticles = popularQuery.data ?? []
  const latestData = latestQuery.data
  const isFetchingLatest = latestQuery.isFetching

  const featured = featuredData?.featured
  const centerArticles = featuredData?.center ?? []
  const rightArticles = featuredData?.right ?? []
  const latestArticles = latestData?.items ?? []
  const hasMore = Boolean(latestData?.hasMore)

  const hasFeatured =
    Boolean(featured) || centerArticles.length > 0 || rightArticles.length > 0
  const hasPopular = popularArticles.length > 0
  // Hide secondary blocks only once settled with nothing to show.
  const showFeatured =
    featuredQuery.isPending || featuredQuery.isError || hasFeatured
  const showPopular =
    popularQuery.isPending || popularQuery.isError || hasPopular

  const allFailed = featuredQuery.isError && latestQuery.isError
  // One empty state when every section loaded with no content.
  const allEmpty =
    featuredQuery.isSuccess &&
    !hasFeatured &&
    latestQuery.isSuccess &&
    latestArticles.length === 0 &&
    popularQuery.isSuccess &&
    !hasPopular

  const isRetrying =
    featuredQuery.isFetching ||
    latestQuery.isFetching ||
    popularQuery.isFetching

  const handleRetryAll = () => {
    void featuredQuery.refetch()
    void latestQuery.refetch()
    void popularQuery.refetch()
  }

  if (allFailed) {
    return (
      <div
        id="news-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:px-12"
      >
        <QueryErrorState
          title={t('ui.newsError')}
          message={t('ui.connectionError')}
          onRetry={handleRetryAll}
          isRetrying={isRetrying}
          className="my-8"
        />
      </div>
    )
  }

  if (allEmpty) {
    return (
      <div
        id="news-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:px-12"
      >
        <EmptyState
          icon={Newspaper}
          message={t('ui.emptyNews', 'No news articles yet. Check back soon.')}
          className="my-8"
        />
      </div>
    )
  }

  return (
    <div
      id="news-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20"
    >
      {showFeatured && (
        <section aria-labelledby="featured-news-heading">
          <Reveal variant="up" distance={20} margin="0px 0px -40px 0px">
            <h2 id="featured-news-heading" className="section-title mb-7">
              {t('ui.featuredEvents')}
            </h2>
          </Reveal>
          {featuredQuery.isError ? (
            <QueryErrorState
              title={t('ui.eventsError')}
              message={t('ui.connectionError')}
              onRetry={() => void featuredQuery.refetch()}
              isRetrying={featuredQuery.isFetching}
            />
          ) : featuredQuery.isPending ? (
            <FeaturedSkeleton />
          ) : (
            <div className="grid items-start gap-8 md:grid-cols-2 lg:grid-cols-[minmax(0,40fr)_minmax(0,28fr)_minmax(0,32fr)] lg:gap-6">
              <Reveal
                variant="up"
                distance={24}
                duration={0.5}
                margin="0px 0px -40px 0px"
              >
                {featured ? (
                  <ArticleCard article={featured} variant="featured" />
                ) : null}
              </Reveal>
              <div className="flex flex-col gap-6">
                {centerArticles.map((article, idx) => (
                  <Reveal
                    key={article.id}
                    variant="up"
                    distance={20}
                    duration={0.45}
                    delay={0.08 + idx * 0.08}
                    margin="0px 0px -40px 0px"
                  >
                    <ArticleCard article={article} variant="compact" />
                  </Reveal>
                ))}
              </div>
              <div className="divide-y divide-border md:col-span-2 md:grid md:grid-cols-2 md:gap-x-6 lg:col-span-1 lg:flex lg:flex-col">
                {rightArticles.map((article, idx) => (
                  <Reveal
                    key={article.id}
                    variant="up"
                    distance={16}
                    duration={0.45}
                    delay={0.12 + idx * 0.07}
                    margin="0px 0px -40px 0px"
                    className="py-4 first:pt-0 last:pb-0"
                  >
                    <ArticleCard article={article} variant="brief" />
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <div
        className={cn(
          'mt-14 grid gap-12 lg:mt-20 lg:gap-10',
          showPopular
            ? 'md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'
            : 'md:grid-cols-1',
        )}
      >
        <section aria-labelledby="latest-news-heading">
          <Reveal variant="up" distance={20} margin="0px 0px -40px 0px">
            <h2 id="latest-news-heading" className="section-title mb-7">
              {t('ui.latestNews')}
            </h2>
          </Reveal>
          {latestQuery.isError ? (
            <QueryErrorState
              title={t('ui.newsError')}
              message={t('ui.connectionError')}
              onRetry={() => void latestQuery.refetch()}
              isRetrying={latestQuery.isFetching}
            />
          ) : latestQuery.isPending ? (
            <div role="status">
              <span className="sr-only">
                {t('ui.loadingNews', 'Loading news…')}
              </span>
              <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <ArticleCardSkeleton key={index} />
                ))}
              </div>
            </div>
          ) : latestArticles.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              message={t(
                'ui.emptyNews',
                'No news articles yet. Check back soon.',
              )}
            />
          ) : (
            <>
              <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2">
                {latestArticles.map((article, index) => (
                  <Reveal
                    key={article.id}
                    variant="up"
                    distance={20}
                    duration={0.45}
                    delay={(index % 2) * 0.08}
                    margin="0px 0px -40px 0px"
                  >
                    <ArticleCard article={article} />
                  </Reveal>
                ))}
              </div>
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isFetchingLatest}
                    onClick={() =>
                      setVisibleCount((count) => count + NEWS_LATEST_PAGE_SIZE)
                    }
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border-border/80 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isFetchingLatest ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span>{t('common.loading')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('ui.showMore')}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {showPopular && (
          <aside
            aria-labelledby="popular-news-heading"
            className={cn(
              'min-w-0 lg:sticky lg:self-start lg:transition-[top] lg:duration-300',
              headerPinned ? 'lg:top-27' : 'lg:top-6',
            )}
          >
            <Reveal variant="up" distance={20} margin="0px 0px -40px 0px">
              <h2 id="popular-news-heading" className="section-title mb-7">
                {t('ui.recommendedPosts')}
              </h2>
            </Reveal>
            {popularQuery.isError ? (
              <QueryErrorState
                variant="compact"
                message={t('ui.recommendedError')}
                onRetry={() => void popularQuery.refetch()}
                isRetrying={popularQuery.isFetching}
              />
            ) : popularQuery.isPending ? (
              <div role="status">
                <span className="sr-only">
                  {t('ui.loadingNews', 'Loading news…')}
                </span>
                <PopularSkeleton />
              </div>
            ) : (
              <ol className="divide-y divide-border">
                {popularArticles.map((article, index) => (
                  <li key={article.id} className="py-5 first:pt-0">
                    <Reveal
                      variant="up"
                      distance={16}
                      duration={0.4}
                      delay={index * 0.06}
                      margin="0px 0px -40px 0px"
                      className="relative flex gap-4"
                    >
                      <span
                        aria-hidden="true"
                        className="text-[28px] leading-none font-bold text-primary"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1 space-y-2">
                        <Link
                          to="/news/$slug"
                          params={{ slug: article.slug }}
                          className="group cursor-pointer rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                        >
                          <h3 className="line-clamp-2 text-base leading-snug font-bold text-[#1b1b36] group-hover:text-[var(--brand-dark)]">
                            {article.title}
                          </h3>
                        </Link>
                        <ArticleMetadata article={article} />
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ol>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}
