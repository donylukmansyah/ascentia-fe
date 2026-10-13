import { Link } from '@tanstack/react-router'
import { Bookmark, Star } from 'lucide-react'

import { useArticleBookmark } from './article-bookmarks'
import type { Article } from '../types/article'

export function ArticleMetadata({ article }: { article: Article }) {
  const { bookmarked, toggle } = useArticleBookmark(article.id)
  const label = `${bookmarked ? 'Remove bookmark for' : 'Bookmark'} ${article.title}`

  return (
    <div className="flex items-start justify-between gap-2 text-xs leading-relaxed text-[#7a8395] sm:text-[13px]">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <time dateTime={article.date}>
          {new Date(`${article.date}T00:00:00Z`).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
          })}
        </time>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          {article.readMinutes} min read
          <Star
            aria-hidden="true"
            className="size-3 shrink-0 fill-[#f28b3b] text-[#f28b3b]"
          />
        </span>
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-pressed={bookmarked}
        title={label}
        className="relative z-10 -my-1 -mr-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Bookmark
          aria-hidden="true"
          className={`size-4 ${bookmarked ? 'fill-current text-[#1b1b36]' : ''}`}
        />
      </button>
    </div>
  )
}

export function ArticleCard({
  article,
  variant = 'latest',
}: {
  article: Article
  variant?: 'featured' | 'compact' | 'brief' | 'latest'
}) {
  const horizontal = variant === 'compact' || variant === 'brief'

  return (
    <article
      className={`relative flex min-w-0 gap-3 ${horizontal ? 'items-start' : 'flex-col gap-4'}`}
    >
      <img
        src={article.image}
        alt={article.alt}
        loading="lazy"
        decoding="async"
        className={`rounded-[4px] object-cover ${variant === 'brief' ? 'h-16 w-20 shrink-0' : variant === 'compact' ? 'h-24 w-20 shrink-0 sm:w-24 lg:w-20' : 'aspect-[16/10] w-full'}`}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Link
          to="/articles/$slug"
          params={{ slug: article.slug }}
          className="group cursor-pointer rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <h3
            className={`text-balance font-bold tracking-[-0.025em] text-[#1b1b36] group-hover:text-[var(--brand-dark)] ${variant === 'featured' ? 'text-2xl leading-tight sm:text-[28px]' : variant === 'latest' ? 'text-lg leading-snug sm:text-xl' : 'text-sm leading-snug'}`}
          >
            {article.title}
          </h3>
        </Link>
        {variant !== 'brief' && (
          <p
            className={`text-sm leading-relaxed text-[#526176] ${variant === 'compact' ? 'line-clamp-2' : ''}`}
          >
            {article.excerpt}
          </p>
        )}
        <ArticleMetadata article={article} />
      </div>
    </article>
  )
}
