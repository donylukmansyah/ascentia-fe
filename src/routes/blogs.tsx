import { createFileRoute } from '@tanstack/react-router'

import { BlogsPage } from '#/features/articles/pages/blogs-page'

export const Route = createFileRoute('/blogs')({ component: BlogsPage })
