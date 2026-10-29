import { queryOptions, useQuery } from '@tanstack/react-query'

import { api, dados } from '@/infrastructure/api'

export const categoriasQuery = queryOptions({
  queryKey: ['categorias'],
  queryFn: ({ signal }) => api.GET('/categories', { signal }).then(dados),
  staleTime: 5 * 60_000,
})

export function useCategorias() {
  return useQuery(categoriasQuery)
}
