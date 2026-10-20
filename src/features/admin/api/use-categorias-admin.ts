import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, dados, semConteudo, type Schema } from '@/infrastructure/api'

export type CategoriaAdmin = Schema<'CategoriaAdminResponse'>

// GET /admin/categorias — todas, inclusive as desativadas.
export const categoriasAdminQuery = queryOptions({
  queryKey: ['admin', 'categorias'],
  queryFn: ({ signal }) => api.GET('/admin/categorias', { signal }).then(dados),
})

export function useCategoriasAdmin() {
  return useQuery(categoriasAdminQuery)
}

/**
 * A lista pública (`['categorias']`) e a do admin mudam juntas. Mapa, recentes, área de incidentes e histórico
 * trazem a categoria embutida (nome, grupo, ícone) ou só as ativas: também são recarregados.
 */
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

// POST /admin/categorias → 201
export function useCriarCategoria() {
  const invalidar = useInvalidarCategorias()
  return useMutation({
    mutationFn: (corpo: Schema<'CriarCategoriaRequest'>) =>
      api.POST('/admin/categorias', { body: corpo }).then(dados),
    onSuccess: invalidar,
  })
}

// PUT /admin/categorias/{id} → 200 (o tipo não muda)
export function useEditarCategoria() {
  const invalidar = useInvalidarCategorias()
  return useMutation({
    mutationFn: ({ id, ...corpo }: Schema<'EditarCategoriaRequest'> & { id: number }) =>
      api.PUT('/admin/categorias/{id}', { params: { path: { id } }, body: corpo }).then(dados),
    onSuccess: invalidar,
  })
}

// PATCH /admin/categorias/{id}/ativa → 204
export function useAlterarAtivaCategoria() {
  const invalidar = useInvalidarCategorias()
  return useMutation({
    mutationFn: ({ id, ativa }: { id: number; ativa: boolean }) =>
      api
        .PATCH('/admin/categorias/{id}/ativa', { params: { path: { id } }, body: { ativa } })
        .then(semConteudo),
    onSuccess: invalidar,
  })
}
