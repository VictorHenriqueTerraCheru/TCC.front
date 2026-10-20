import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api, dados, semConteudo, type Schema } from '@/infrastructure/api'

/** Os grupos aparecem no mapa, nos filtros e no registro: tudo que os lê é recarregado. */
function useInvalidarGrupos() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['grupos'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'categorias'] })
    void queryClient.invalidateQueries({ queryKey: ['problemas'] })
    void queryClient.invalidateQueries({ queryKey: ['incidentes'] })
  }
}

// POST /admin/grupos → 201 (a chave é gerada pela API)
export function useCriarGrupo() {
  const invalidar = useInvalidarGrupos()
  return useMutation({
    mutationFn: (corpo: Schema<'CriarGrupoRequest'>) =>
      api.POST('/admin/grupos', { body: corpo }).then(dados),
    onSuccess: invalidar,
  })
}

// PUT /admin/grupos/{chave} → 200 (tipo e chave não mudam)
export function useEditarGrupo() {
  const invalidar = useInvalidarGrupos()
  return useMutation({
    mutationFn: ({ chave, ...corpo }: Schema<'EditarGrupoRequest'> & { chave: string }) =>
      api.PUT('/admin/grupos/{chave}', { params: { path: { chave } }, body: corpo }).then(dados),
    onSuccess: invalidar,
  })
}

// DELETE /admin/grupos/{chave} → 204; 409 grupo-em-uso se tiver categorias
export function useApagarGrupo() {
  const invalidar = useInvalidarGrupos()
  return useMutation({
    mutationFn: (chave: string) =>
      api.DELETE('/admin/grupos/{chave}', { params: { path: { chave } } }).then(semConteudo),
    onSuccess: invalidar,
  })
}
