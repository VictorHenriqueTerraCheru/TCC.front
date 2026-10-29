import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAutenticado } from '@/features/auth'
import { api, dados } from '@/infrastructure/api'

export const meQuery = queryOptions({
  queryKey: ['me'],
  queryFn: ({ signal }) => api.GET('/me', { signal }).then(dados),
  staleTime: 0,
})

export function useMe() {
  const autenticado = useAutenticado()
  return useQuery({ ...meQuery, enabled: autenticado })
}

export function useAtualizarNome() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (nome: string) => api.PATCH('/me', { body: { name: nome } }).then(dados),
    onSuccess: (me) => queryClient.setQueryData(meQuery.queryKey, me),
  })
}
