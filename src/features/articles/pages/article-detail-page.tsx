import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Check, RotateCcw, Share2, Star } from 'lucide-react'

import { Breadcrumb } from '#/components/ui/breadcrumb'
import { Button } from '#/components/ui/button'
import { Reveal } from '#/components/ui/reveal'
import SocialButton from '#/components/ui/social-button'
import { useLanguage } from '#/lib/i18n'

import { ArticleCard } from '../components/article-card'
import { BlogCard } from '../components/blog-card'
import type { Article, ArticleDetailData } from '../types/article'

export function ArticleDetailPage({
  article,
  relatedArticles = [],
  backTo = '/news',
}: {
  article: ArticleDetailData
  relatedArticles?: Article[]
  backTo?: '/news' | '/blogs'
}) {
  const { language, pick, t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const isBlogs = backTo === '/blogs'
  const parentLabel = isBlogs ? t('nav.blogs', 'Blogs') : t('nav.news', 'News')
  const displayTitle = pick(
    { id: article.title, en: article.titleEn },
    article.title,
  )
  const displayContent = pick(
    { id: article.content, en: article.contentEn },
    article.content,
  )

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return
    void navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const [shareUrl, setShareUrl] = useState('')
  useEffect(() => {
    setShareUrl(window.location.href)
  }, [])
  const shareTitle = encodeURIComponent(displayTitle)

  return (
    <article className="min-h-screen bg-background pb-20 pt-28 sm:pt-36 lg:pb-28">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Reveal variant="up" distance={20} duration={0.5}>
          <Breadcrumb
            items={[
              { label: t('nav.home', 'Home'), to: '/' },
              { label: parentLabel, to: backTo },
              { label: displayTitle },
            ]}
            variant="light"
            className="mb-8"
          />

          {article.categories && article.categories.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {article.categories.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-balance text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-[-0.03em] text-[#1b1b36] sm:leading-tight">
            {displayTitle}
          </h1>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
            <div className="flex items-center gap-3">
              {article.author?.avatarUrl ? (
                <img
                  src={article.author.avatarUrl}
                  alt=""
                  className="size-10 rounded-full object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="grid size-10 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary"
                >
                  {article.author?.name.charAt(0) || 'A'}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-[#1b1b36]">
                  {article.author?.name || 'PT Ascentia Arsya Analitika'}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <time dateTime={article.date}>
                    {new Date(`${article.date}T00:00:00Z`).toLocaleDateString(
                      language === 'id' ? 'id-ID' : 'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'UTC',
                      },
                    )}
                  </time>
                  <span>·</span>
                  <span>
                    {article.readMinutes}{' '}
                    {t('articles.readingTime', 'min read')}
                  </span>
                  <Star
                    aria-hidden="true"
                    className="size-3 shrink-0 fill-[#f28b3b] text-[#f28b3b]"
                  />
                </div>
              </div>
            </div>

            {/* Mobile expanding share pill */}
            <div className="sm:hidden">
              <SocialButton shareUrl={shareUrl} shareTitle={shareTitle} />
            </div>

            {/* Desktop share buttons */}
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={handleCopyLink}
                title={
                  copied
                    ? t('ui.copied', 'Copied!')
                    : t('ui.copyLink', 'Copy link')
                }
                aria-label={t('ui.copyLink', 'Copy link')}
                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
              >
                {copied ? (
                  <Check
                    className="size-4 text-emerald-600"
                    aria-hidden="true"
                  />
                ) : (
                  <Share2 className="size-4" aria-hidden="true" />
                )}
              </button>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t('ui.shareOn', 'Share on')} LinkedIn`}
                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-[#0077b5] focus-visible:outline-2 focus-visible:outline-primary"
              >
                <LinkedInIcon className="size-4" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t('ui.shareOn', 'Share on')} X`}
                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
              >
                <TwitterIcon className="size-4" />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t('ui.shareOn', 'Share on')} Facebook`}
                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-[#1877f2] focus-visible:outline-2 focus-visible:outline-primary"
              >
                <FacebookIcon className="size-4" />
              </a>
            </div>
          </div>
        </Reveal>

        {article.image && (
          <Reveal variant="up" distance={24} delay={0.08} duration={0.5}>
            <div className="mt-8 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
              <img
                src={article.image}
                alt={article.alt}
                className="aspect-[16/10] w-full object-cover sm:aspect-[21/10]"
                fetchPriority="high"
              />
            </div>
          </Reveal>
        )}

        <Reveal variant="up" distance={16} delay={0.12} duration={0.5}>
          <div
            className="article-rich-text mt-10"
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />
        </Reveal>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
          <Link
            to={backTo}
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            ←{' '}
            {isBlogs
              ? t('ui.backBlogs', 'Back to Blogs')
              : t('ui.backNews', 'Back to News')}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {t('articles.shareArticle', 'Share this article')}:
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={t('ui.copyLink', 'Copy link')}
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Share2 className="size-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {relatedArticles.length > 0 && (
        <section
          aria-labelledby="related-news-heading"
          className="mx-auto mt-20 max-w-7xl border-t border-border px-5 pt-16 sm:px-8 lg:px-12"
        >
          <Reveal variant="up" distance={20} margin="0px 0px -40px 0px">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 id="related-news-heading" className="section-title">
                  {isBlogs
                    ? t('ui.relatedBlogs', 'Related blogs')
                    : t('ui.relatedNews', 'Related news')}
                </h2>
                <p className="section-description mt-4">
                  {t(
                    'ui.relatedArticlesDescription',
                    'More updates and insights from Ascentia',
                  )}
                </p>
              </div>
              <Link
                to={backTo}
                className="hidden cursor-pointer text-sm font-semibold text-primary hover:underline sm:inline-block"
              >
                {isBlogs
                  ? t('ui.viewAllBlogs', 'View all blogs')
                  : t('ui.viewAllNews', 'View all news')}{' '}
                →
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((item, index) => (
              <Reveal
                key={item.id}
                variant="up"
                distance={24}
                duration={0.45}
                delay={index * 0.08}
                margin="0px 0px -40px 0px"
                className="h-full"
              >
                {isBlogs ? (
                  <BlogCard article={item} />
                ) : (
                  <ArticleCard article={item} variant="latest" />
                )}
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

export function ArticleNotFoundPage() {
  const { t } = useLanguage()
  return (
    <section className="mx-auto max-w-3xl px-5 pb-20 pt-36 text-center sm:px-8 sm:pt-44">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
        {t('ui.articleNotFound', 'Article not found')}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        {t(
          'ui.articleMissing',
          'The article you are looking for may have been moved, renamed, or is temporarily unavailable.',
        )}
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          to="/news"
          className="inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          {t('ui.backNews', 'Back to News')}
        </Link>
      </div>
    </section>
  )
}

export function ArticleDetailError({ onRetry }: { onRetry: () => void }) {
  const { t } = useLanguage()
  return (
    <section className="mx-auto max-w-3xl px-5 pb-20 pt-36 text-center sm:px-8 sm:pt-44">
      <h1 className="text-2xl font-bold text-destructive sm:text-3xl">
        {t('ui.articleError', 'Failed to load article')}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        {t(
          'ui.connectionError',
          'We are having trouble reaching the server. Please try again.',
        )}
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Button
          type="button"
          onClick={onRetry}
          className="inline-flex cursor-pointer items-center gap-2"
        >
          <RotateCcw className="size-4" />
          {t('common.tryAgain', 'Try again')}
        </Button>
        <Link
          to="/news"
          className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          {t('ui.backNews', 'Back to News')}
        </Link>
      </div>
    </section>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}
