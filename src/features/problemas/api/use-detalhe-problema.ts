import { queryOptions, useQuery } from '@tanstack/react-query'

import { api, dados } from '@/infrastructure/api'

export function detalheProblemaQuery(id: string) {
  return queryOptions({
    queryKey: ['problemas', 'detalhe', id],
    queryFn: ({ signal }) =>
      api.GET('/problemas/{id}', { params: { path: { id } }, signal }).then(dados),
  })
}

export function useDetalheProblema(id: string) {
  return useQuery(detalheProblemaQuery(id))
}
