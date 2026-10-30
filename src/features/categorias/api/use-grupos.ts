import { queryOptions, useQuery } from '@tanstack/react-query'

import { api, unwrapData } from '@/infrastructure/api'

export const groupsQuery = queryOptions({
  queryKey: ['groups'],
  queryFn: ({ signal }) => api.GET('/groups', { signal }).then(unwrapData),
  staleTime: 5 * 60_000,
})

export function useGroups() {
  return useQuery(groupsQuery)
}
