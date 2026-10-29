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
    mutationFn: (corpo: Schema<'CriarGrupoRequest'>) =>
      api.POST('/admin/grupos', { body: corpo }).then(dados),
    onSuccess: invalidar,
  })
}

export function useEditarGrupo() {
  const invalidar = useInvalidarGrupos()
  return useMutation({
    mutationFn: ({ chave, ...corpo }: Schema<'EditarGrupoRequest'> & { chave: string }) =>
      api.PUT('/admin/grupos/{chave}', { params: { path: { chave } }, body: corpo }).then(dados),
    onSuccess: invalidar,
  })
}

export function useApagarGrupo() {
  const invalidar = useInvalidarGrupos()
  return useMutation({
    mutationFn: (chave: string) =>
      api.DELETE('/admin/grupos/{chave}', { params: { path: { chave } } }).then(semConteudo),
    onSuccess: invalidar,
  })
}
