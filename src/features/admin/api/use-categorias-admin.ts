import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, dados, semConteudo, type Schema } from '@/infrastructure/api'

export type CategoriaAdmin = Schema<'CategoryAdminResponse'>

export const categoriasAdminQuery = queryOptions({
  queryKey: ['admin', 'categorias'],
  queryFn: ({ signal }) => api.GET('/admin/categories', { signal }).then(dados),
})

export function useCategoriasAdmin() {
  return useQuery(categoriasAdminQuery)
}

function useInvalidarCategorias() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'categorias'] })
    void queryClient.invalidateQueries({ queryKey: ['categorias'] })
    void queryClient.invalidateQueries({ queryKey: ['problemas'] })
    void queryClient.invalidateQueries({ queryKey: ['incidentes'] })
    void queryClient.invalidateQueries({ queryKey: ['me', 'historico'] })
  }
}

export function useCriarCategoria() {
  const invalidar = useInvalidarCategorias()
  return useMutation({
    mutationFn: (corpo: Schema<'CreateCategoryRequest'>) =>
      api.POST('/admin/categories', { body: corpo }).then(dados),
    onSuccess: invalidar,
  })
}

export function useEditarCategoria() {
  const invalidar = useInvalidarCategorias()
  return useMutation({
    mutationFn: ({ id, ...corpo }: Schema<'EditCategoryRequest'> & { id: number }) =>
      api.PUT('/admin/categories/{id}', { params: { path: { id } }, body: corpo }).then(dados),
    onSuccess: invalidar,
  })
}

export function useAlterarAtivaCategoria() {
  const invalidar = useInvalidarCategorias()
  return useMutation({
    mutationFn: ({ id, active: ativa }: { id: number; active: boolean }) =>
      api
        .PATCH('/admin/categories/{id}/active', {
          params: { path: { id } },
          body: { active: ativa },
        })
        .then(semConteudo),
    onSuccess: invalidar,
  })
}
