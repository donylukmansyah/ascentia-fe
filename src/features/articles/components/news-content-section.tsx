import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'

import { ArticleCard, ArticleMetadata } from './article-card'
import {
  dummyNewsSelections,
  getLatestPool,
  latestPageSize,
  selectDummyArticles,
} from '../constants/dummy-articles'

export function NewsContentSection() {
  const featured = selectDummyArticles(dummyNewsSelections.featured)[0]
  const [visibleCount, setVisibleCount] = useState(latestPageSize)
  const latestPool = getLatestPool()
  const visibleLatest = latestPool.slice(0, visibleCount)

  return (
    <div
      id="news-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20"
    >
      <section aria-labelledby="featured-news-heading">
        <h2
          id="featured-news-heading"
          className="mb-7 text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-bold tracking-[-0.03em] text-[#1b1b36]"
        >
          Features Events
        </h2>
        <div className="grid items-start gap-8 md:grid-cols-2 lg:grid-cols-[minmax(0,40fr)_minmax(0,28fr)_minmax(0,32fr)] lg:gap-6">
          <ArticleCard article={featured} variant="featured" />
          <div className="flex flex-col gap-6">
            {selectDummyArticles(dummyNewsSelections.center).map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="compact"
              />
            ))}
          </div>
          <div className="divide-y divide-border md:col-span-2 md:grid md:grid-cols-2 md:gap-x-6 lg:col-span-1 lg:flex lg:flex-col">
            {selectDummyArticles(dummyNewsSelections.right).map((article) => (
              <div key={article.id} className="py-4 first:pt-0 last:pb-0">
                <ArticleCard article={article} variant="brief" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-14 grid items-start gap-12 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:mt-20 lg:gap-10">
        <section aria-labelledby="latest-news-heading">
          <h2
            id="latest-news-heading"
            className="mb-7 text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-bold tracking-[-0.03em] text-[#1b1b36]"
          >
            Latest News
          </h2>
          <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2">
            {visibleLatest.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          {visibleCount < latestPool.length && (
            <div className="mt-10 flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setVisibleCount((count) => count + latestPageSize)
                }
                className="cursor-pointer"
              >
                Load more
              </Button>
            </div>
          )}
        </section>
        <aside aria-labelledby="popular-news-heading">
          <h2
            id="popular-news-heading"
            className="mb-7 text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-bold tracking-[-0.03em] text-[#1b1b36]"
          >
            Popular post
          </h2>
          <ol className="divide-y divide-border">
            {selectDummyArticles(dummyNewsSelections.popular).map(
              (article, index) => (
                <li
                  key={article.id}
                  className="relative flex gap-4 py-5 first:pt-0"
                >
                  <span
                    aria-hidden="true"
                    className="text-[28px] leading-none font-bold text-primary"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <Link
                      to="/articles/$slug"
                      params={{ slug: article.slug }}
                      className="group cursor-pointer rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    >
                      <h3 className="text-base leading-snug font-bold text-[#1b1b36] group-hover:text-[var(--brand-dark)]">
                        {article.title}
                      </h3>
                    </Link>
                    <ArticleMetadata article={article} />
                  </div>
                </li>
              ),
            )}
          </ol>
        </aside>
      </div>
      <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
        Sample editorial content. Dates, reading times, and popular selections
        are illustrative.
      </p>
    </div>
  )
}
