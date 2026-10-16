import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { validateSearchInput } from './search-input'

export const getSearch = createServerFn({ method: 'GET' })
  .validator(validateSearchInput)
  .handler(async ({ data }) => {
    const { readSearch } = await import('./search-source.server')
    return readSearch(data, getRequest().signal)
  })
