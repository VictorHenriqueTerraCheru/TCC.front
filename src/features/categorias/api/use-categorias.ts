import { queryOptions, useQuery } from '@tanstack/react-query'

import { api, unwrapData } from '@/infrastructure/api'

export const categoriesQuery = queryOptions({
  queryKey: ['categories'],
  queryFn: ({ signal }) => api.GET('/categories', { signal }).then(unwrapData),
  staleTime: 5 * 60_000,
})

export function useCategories() {
  return useQuery(categoriesQuery)
}
