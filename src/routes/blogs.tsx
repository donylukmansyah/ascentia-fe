import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/blogs')({ component: Blogs })

function Blogs() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-32 sm:px-8 lg:px-12">
      <h1 className="text-4xl font-bold">Blogs</h1>
    </div>
  )
}
