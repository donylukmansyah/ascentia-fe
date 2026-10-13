import { createFileRoute } from '@tanstack/react-router'

import { NewsPage } from '#/features/articles/pages/news-page'

export const Route = createFileRoute('/news')({ component: NewsPage })
