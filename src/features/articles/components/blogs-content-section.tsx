import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { PagePagination } from '#/components/ui/pagination'
import { QueryErrorState } from '#/components/ui/query-error-state'
import { Reveal } from '#/components/ui/reveal'
import { useLanguage } from '#/lib/i18n'

import { BlogCard } from './blog-card'
import {
  BLOG_LIST_PAGE_SIZE,
  blogArticlesQueryOptions,
} from '../api/article-queries'

// Skeleton placeholder matching blog card aspect ratio
function BlogCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full flex-col overflow-hidden rounded-[4px] border border-border bg-white animate-pulse motion-reduce:animate-none"
    >
      <div className="aspect-[16/10] w-full bg-[color-mix(in_srgb,var(--primary)_8%,var(--muted))]" />
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-2">
          <div className="h-4 w-4/5 rounded bg-muted" />
          <div className="h-3.5 w-3/5 rounded bg-muted" />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}

export function BlogsContentSection() {
  const { t } = useLanguage()
  const search: { page?: number } = useSearch({ from: '/blogs/' })
  const page = search.page || 1
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLElement>(null)

  const {
    data: blogData,
    isPending,
    isError,
    refetch,
    isFetching,
  } = useQuery(blogArticlesQueryOptions(page, BLOG_LIST_PAGE_SIZE))

  const items = blogData?.items || []
  const totalPages = Math.max(1, blogData?.totalPages || 1)

  const handlePageChange = (nextPage: number) => {
    void navigate({
      to: '/blogs',
      search: { page: nextPage },
    })
    sectionRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    })
  }

  return (
    <section
      ref={sectionRef}
      id="blogs-content"
      tabIndex={-1}
      aria-labelledby="blogs-list-heading"
      className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20"
    >
      <Reveal variant="up" distance={20} margin="0px 0px -40px 0px">
        <h2 id="blogs-list-heading" className="section-title mb-7">
          {t('ui.recentBlogs', 'Recent blog posts')}
        </h2>
      </Reveal>

      {isPending ? (
        <div role="status">
          <span className="sr-only">
            {t('ui.loadingBlogs', 'Loading blog articles…')}
          </span>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <BlogCardSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : isError ? (
        <QueryErrorState
          title={t('ui.blogsError', 'Unable to load blog articles')}
          message={t(
            'ui.connectionError',
            'We are having trouble reaching the server. Please try again.',
          )}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
          <p className="text-base text-muted-foreground">
            {t('ui.emptyBlogs', 'No blog articles yet. Check back soon.')}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((article, index) => (
            <li key={article.id} className="min-w-0">
              <Reveal
                variant="up"
                distance={24}
                duration={0.45}
                margin="0px 0px -40px 0px"
                delay={(index % 4) * 0.06}
                className="h-full"
              >
                <BlogCard article={article} />
              </Reveal>
            </li>
          ))}
        </ul>
      )}

      {!isError && totalPages > 1 && (
        <PagePagination
          page={page}
          pageHref={(next) => (next > 1 ? `/blogs?page=${next}` : '/blogs')}
          totalPages={totalPages}
          className="mt-10"
          onPageChange={handlePageChange}
        />
      )}
    </section>
  )
}
