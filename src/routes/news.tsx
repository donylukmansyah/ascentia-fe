import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/news')({
  component: NewsLayout,
})

function NewsLayout() {
  return <Outlet />
}
