import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api, dados, semConteudo, type Schema } from '@/infrastructure/api'

function useInvalidarGrupos() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['grupos'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'categorias'] })
    void queryClient.invalidateQueries({ queryKey: ['problemas'] })
    void queryClient.invalidateQueries({ queryKey: ['incidentes'] })
  }
}

export function useCriarGrupo() {
  const invalidar = useInvalidarGrupos()
  return useMutation({
    mutationFn: (corpo: Schema<'CreateGroupRequest'>) =>
      api.POST('/admin/groups', { body: corpo }).then(dados),
    onSuccess: invalidar,
  })
}

export function useEditarGrupo() {
  const invalidar = useInvalidarGrupos()
  return useMutation({
    mutationFn: ({ key: chave, ...corpo }: Schema<'EditGroupRequest'> & { key: string }) =>
      api.PUT('/admin/groups/{key}', { params: { path: { key: chave } }, body: corpo }).then(dados),
    onSuccess: invalidar,
  })
}

export function useApagarGrupo() {
  const invalidar = useInvalidarGrupos()
  return useMutation({
    mutationFn: (chave: string) =>
      api.DELETE('/admin/groups/{key}', { params: { path: { key: chave } } }).then(semConteudo),
    onSuccess: invalidar,
  })
}
