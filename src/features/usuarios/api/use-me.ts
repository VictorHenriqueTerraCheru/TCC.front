import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAutenticado } from '@/features/auth'
import { api, dados } from '@/infrastructure/api'

// GET /me — perfil atual vem daqui, não da claim do token (regra 14).
export const meQuery = queryOptions({
  queryKey: ['me'],
  queryFn: ({ signal }) => api.GET('/me', { signal }).then(dados),
  // Sempre confere ao abrir o perfil: uma aprovação de verificação muda o perfil no banco.
  staleTime: 0,
})

/** Só busca com sessão; para visitante fica desligado. */
export function useMe() {
  const autenticado = useAutenticado()
  return useQuery({ ...meQuery, enabled: autenticado })
}

// PATCH /me
export function useAtualizarNome() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (nome: string) => api.PATCH('/me', { body: { nome } }).then(dados),
    onSuccess: (me) => queryClient.setQueryData(meQuery.queryKey, me),
  })
}
