import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { PagePagination } from '#/components/ui/pagination'
import { Reveal } from '#/components/ui/reveal'

import { BlogCard } from './blog-card'
import {
  BLOG_LIST_PAGE_SIZE,
  blogArticlesQueryOptions,
} from '../api/article-queries'

export function BlogsContentSection() {
  const search: { page?: number } = useSearch({ from: '/blogs/' })
  const page = search.page || 1
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLElement>(null)

  const { data: blogData } = useQuery(
    blogArticlesQueryOptions(page, BLOG_LIST_PAGE_SIZE),
  )

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
        <h2
          id="blogs-list-heading"
          className="mb-7 text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-bold tracking-[-0.03em] text-foreground"
        >
          Recent blogs post
        </h2>
      </Reveal>

      {items.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
          <p className="text-base text-muted-foreground">
            No blog articles found at this time. Please check back soon!
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

      {totalPages > 1 && (
        <PagePagination
          page={page}
          totalPages={totalPages}
          className="mt-10"
          onPageChange={handlePageChange}
        />
      )}
    </section>
  )
}
