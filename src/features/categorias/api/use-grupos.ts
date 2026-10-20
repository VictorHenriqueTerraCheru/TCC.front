import { queryOptions, useQuery } from '@tanstack/react-query'

import { api, dados } from '@/infrastructure/api'

// GET /grupos — o admin cria e edita em runtime; as mutations do admin invalidam esta chave.
export const gruposQuery = queryOptions({
  queryKey: ['grupos'],
  queryFn: ({ signal }) => api.GET('/grupos', { signal }).then(dados),
  staleTime: 5 * 60_000,
})

export function useGrupos() {
  return useQuery(gruposQuery)
}
