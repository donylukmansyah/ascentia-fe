import { useRef, useState } from 'react'

import { PagePagination } from '#/components/ui/pagination'

import { BlogCard } from './blog-card'
import { dummyBlogs } from '../constants/dummy-articles'

export function BlogsContentSection() {
  const [page, setPage] = useState(1)
  const sectionRef = useRef<HTMLElement>(null)
  const pageSize = 12
  const totalPages = Math.ceil(dummyBlogs.length / pageSize)
  const visible = dummyBlogs.slice((page - 1) * pageSize, page * pageSize)

  return (
    <section
      ref={sectionRef}
      id="blogs-content"
      tabIndex={-1}
      aria-labelledby="blogs-list-heading"
      className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20"
    >
      <h2
        id="blogs-list-heading"
        className="mb-7 text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-bold tracking-[-0.03em] text-foreground"
      >
        Recent blogs post
      </h2>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((article) => (
          <li key={article.id} className="min-w-0">
            <BlogCard article={article} />
          </li>
        ))}
      </ul>
      <PagePagination
        page={page}
        totalPages={totalPages}
        className="mt-10"
        onPageChange={(next) => {
          setPage(next)
          sectionRef.current?.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
              .matches
              ? 'instant'
              : 'smooth',
            block: 'start',
          })
        }}
      />
    </section>
  )
}
