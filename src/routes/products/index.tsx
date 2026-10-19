import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/products/')({
  beforeLoad: () => {
    throw redirect({
      to: '/products/brands',
      statusCode: 301,
      search: { category: '', q: '', page: 1 },
    })
  },
})
