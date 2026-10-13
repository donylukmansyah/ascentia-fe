import { Link } from '@tanstack/react-router'
import { Clock3 } from 'lucide-react'

import type { Article } from '../types/article'

export function BlogCard({ article }: { article: Article }) {
  const author = article.author?.name.trim() || 'Ascentia'
  const initial = author.split(/\s+/).at(-1)?.charAt(0).toUpperCase()

  return (
    <article className="group/blog-card relative flex h-full min-w-0 flex-col overflow-hidden rounded-[4px] border border-border bg-white transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md motion-reduce:hover:translate-none">
      <Link
        to="/articles/$slug"
        params={{ slug: article.slug }}
        className="flex h-full cursor-pointer flex-col focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <img
            src={article.image}
            alt={article.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/blog-card:scale-105 motion-reduce:transition-none"
          />
        </div>
        <div className="flex flex-1 flex-col px-4 pt-4 pb-3">
          <h3 className="line-clamp-2 text-base leading-snug font-bold text-foreground transition-colors duration-200 group-hover/blog-card:text-primary">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-description-text">
            {article.excerpt}
          </p>
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
            <div className="flex min-w-0 items-center gap-2">
              {article.author?.avatarUrl ? (
                <img
                  src={article.author.avatarUrl}
                  alt=""
                  loading="lazy"
                  className="size-7 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-foreground transition-colors duration-200 group-hover/blog-card:bg-primary/10 group-hover/blog-card:text-primary"
                >
                  {initial}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">
                  {author}
                </p>
                <time
                  dateTime={article.date}
                  className="block text-[11px] leading-relaxed text-description-text"
                >
                  {new Date(`${article.date}T00:00:00Z`).toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: 'UTC',
                    },
                  )}
                </time>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold whitespace-nowrap text-accent">
              <Clock3
                className="size-3 text-accent transition-transform duration-300 group-hover/blog-card:rotate-12 motion-reduce:transition-none"
                aria-hidden="true"
              />
              {article.readMinutes} min read
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
