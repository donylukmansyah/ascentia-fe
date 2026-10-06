import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="pt-[1000px] bg-amber-800 mx-auto flex h-20 max-w-7xl items-center justify-between gap-8 px-5 sm:px-8 lg:h-24 lg:px-12">
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <p className="mt-4 text-lg">
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>
    </div>
  )
}
