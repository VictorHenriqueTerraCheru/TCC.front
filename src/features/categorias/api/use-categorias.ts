import { queryOptions, useQuery } from '@tanstack/react-query'

import { api, dados } from '@/infrastructure/api'

// GET /categorias — seed fixo; não muda durante a sessão.
export const categoriasQuery = queryOptions({
  queryKey: ['categorias'],
  queryFn: ({ signal }) => api.GET('/categorias', { signal }).then(dados),
  staleTime: Infinity,
})

export function useCategorias() {
  return useQuery(categoriasQuery)
}
