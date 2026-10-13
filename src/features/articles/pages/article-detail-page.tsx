import { Link } from '@tanstack/react-router'

import { ArticleMetadata } from '../components/article-card'
import type { Article } from '../types/article'

export function ArticleDetailPage({
  article,
  backTo = '/news',
}: {
  article: Article
  backTo?: '/news' | '/blogs'
}) {
  return (
    <article className="mx-auto max-w-7xl px-5 pt-36 pb-20 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link
          to={backTo}
          className="cursor-pointer text-sm font-semibold text-[var(--brand-dark)] underline underline-offset-4"
        >
          Back to {backTo === '/blogs' ? 'Blogs' : 'News'}
        </Link>
        <p className="mt-8 text-sm text-muted-foreground">
          Sample article · Editorial preview
        </p>
        <h1 className="mt-3 mb-5 text-balance text-[clamp(1.875rem,4vw,3rem)] leading-tight font-bold tracking-[-0.03em]">
          {article.title}
        </h1>
        <ArticleMetadata article={article} />
        <img
          src={article.image}
          alt={article.alt}
          className="mt-8 aspect-[16/10] w-full rounded-[4px] object-cover"
        />
        <p className="mt-8 text-base leading-relaxed">{article.excerpt}</p>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          This is dummy editorial content, not an official company announcement.
          A full article will replace this preview when WordPress content is
          connected. The date and reading time are illustrative.
        </p>
      </div>
    </article>
  )
}

export function ArticleNotFoundPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-36 pb-20 sm:px-8 lg:px-12">
      <h1 className="mb-5 text-3xl font-bold">Article not found</h1>
      <Link
        to="/news"
        className="cursor-pointer text-[var(--brand-dark)] underline underline-offset-4"
      >
        Back to News
      </Link>
    </section>
  )
}
