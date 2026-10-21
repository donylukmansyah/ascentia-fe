import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { shouldCountPageView } from './visitor-policy'

// Counts every page view; same visitor can increment many times.
export const trackPageView = createServerFn({ method: 'POST' }).handler(
  async () => {
    const request = getRequest()
    if (!shouldCountPageView(request)) {
      return { success: false, views: 0 }
    }
    const { recordPageView } = await import('./visitor-source.server')
    return recordPageView()
  },
)
