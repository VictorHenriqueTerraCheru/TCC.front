import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuthenticated } from '@/features/auth'
import { api, unwrapData } from '@/infrastructure/api'

export const meQuery = queryOptions({
  queryKey: ['me'],
  queryFn: ({ signal }) => api.GET('/me', { signal }).then(unwrapData),
  staleTime: 0,
})

export function useMe() {
  const authenticated = useAuthenticated()
  return useQuery({ ...meQuery, enabled: authenticated })
}

export function useUpdateName() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => api.PATCH('/me', { body: { name } }).then(unwrapData),
    onSuccess: (me) => queryClient.setQueryData(meQuery.queryKey, me),
  })
}
