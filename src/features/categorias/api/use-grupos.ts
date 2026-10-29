import { queryOptions, useQuery } from '@tanstack/react-query'

import { api, dados } from '@/infrastructure/api'

export const gruposQuery = queryOptions({
  queryKey: ['grupos'],
  queryFn: ({ signal }) => api.GET('/groups', { signal }).then(dados),
  staleTime: 5 * 60_000,
})

export function useGrupos() {
  return useQuery(gruposQuery)
}
