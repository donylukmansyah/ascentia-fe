import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Check, Share2, Star } from 'lucide-react'

import { useLanguage } from '#/lib/i18n'
import { BLOG_CATEGORY_SLUG } from '../constants/categories'
import type { Article } from '../types/article'

export function ArticleMetadata({ article }: { article: Article }) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const path = article.categories?.some((c) => c.slug === BLOG_CATEGORY_SLUG)
      ? `/blogs/${article.slug}`
      : `/news/${article.slug}`
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}${path}`
        : `https://ascentia.co.id${path}`

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Ignore clipboard error
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
      <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
        <time dateTime={article.date}>
          {new Date(`${article.date}T00:00:00Z`).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
          })}
        </time>
        <span>·</span>
        <span>
          {article.readMinutes} {t('articles.readingTime', 'min read')}
        </span>
        <Star
          aria-hidden="true"
          className="size-3 shrink-0 fill-[#f28b3b] text-[#f28b3b]"
        />
      </div>
      <button
        type="button"
        onClick={handleShare}
        aria-label={`Copy link for ${article.title}`}
        title={copied ? 'Link copied!' : 'Copy link'}
        className="relative z-10 -my-1 -mr-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {copied ? (
          <Check className="size-4 text-emerald-600" aria-hidden="true" />
        ) : (
          <Share2 className="size-4" aria-hidden="true" />
        )}
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
  const { pick } = useLanguage()
  const horizontal = variant === 'compact' || variant === 'brief'
  const displayTitle = pick(
    { id: article.title, en: article.titleEn },
    article.title,
  )
  const displayExcerpt = pick(
    { id: article.excerpt, en: article.excerptEn },
    article.excerpt,
  )

  return (
    <article
      className={`group/article relative flex min-w-0 gap-3 transition-transform duration-300 hover:-translate-y-1 motion-reduce:hover:translate-none ${horizontal ? 'items-start' : 'flex-col gap-4'}`}
    >
      <div
        className={`overflow-hidden rounded-[4px] ${variant === 'brief' ? 'h-16 w-20 shrink-0' : variant === 'compact' ? 'h-24 w-20 shrink-0 sm:w-24 lg:w-20' : 'aspect-[16/10] w-full'}`}
      >
        <img
          src={article.image}
          alt={article.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/article:scale-105 motion-reduce:transition-none"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Link
          to="/news/$slug"
          params={{ slug: article.slug }}
          className="group cursor-pointer rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <h3
            className={`line-clamp-2 text-balance font-bold tracking-[-0.025em] text-[#1b1b36] group-hover:text-[var(--brand-dark)] ${variant === 'featured' ? 'text-2xl leading-tight sm:text-[28px]' : variant === 'latest' ? 'text-lg leading-snug sm:text-xl' : 'text-sm leading-snug'}`}
          >
            {displayTitle}
          </h3>
        </Link>
        {variant !== 'brief' && (
          <p
            className={`text-sm leading-relaxed text-[#526176] ${variant === 'compact' ? 'line-clamp-2' : 'line-clamp-3'}`}
          >
            {displayExcerpt}
          </p>
        )}
        <ArticleMetadata article={article} />
      </div>
    </article>
  )
}
