import { queryOptions, useQuery } from '@tanstack/react-query'

import { api, dados } from '@/infrastructure/api'

// GET /categorias — só as ativas. O admin altera em runtime; as mutations do admin invalidam esta chave.
export const categoriasQuery = queryOptions({
  queryKey: ['categorias'],
  queryFn: ({ signal }) => api.GET('/categorias', { signal }).then(dados),
  staleTime: 5 * 60_000,
})

export function useCategorias() {
  return useQuery(categoriasQuery)
}
