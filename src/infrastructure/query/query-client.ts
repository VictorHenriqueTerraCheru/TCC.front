import { QueryClient } from '@tanstack/react-query'

import { isApiError } from '../api/api-error'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        networkMode: 'always',
        retry: (failures, error) => !(isApiError(error) && error.status < 500) && failures < 2,
      },
      mutations: { retry: false, networkMode: 'always' },
    },
  })
}
