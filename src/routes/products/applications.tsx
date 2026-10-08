import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/products/applications')({
  component: ProductApplications,
})

function ProductApplications() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-32 sm:px-8 lg:px-12">
      <h1 className="text-4xl font-bold">Product Applications</h1>
    </div>
  )
}
