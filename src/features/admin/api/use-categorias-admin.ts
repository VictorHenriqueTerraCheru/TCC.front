import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, unwrapData, unwrapEmpty, type Schema } from '@/infrastructure/api'

export type AdminCategory = Schema<'CategoryAdminResponse'>

export const adminCategoriesQuery = queryOptions({
  queryKey: ['admin', 'categories'],
  queryFn: ({ signal }) => api.GET('/admin/categories', { signal }).then(unwrapData),
})

export function useAdminCategories() {
  return useQuery(adminCategoriesQuery)
}

function useInvalidateCategories() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    void queryClient.invalidateQueries({ queryKey: ['categories'] })
    void queryClient.invalidateQueries({ queryKey: ['issues'] })
    void queryClient.invalidateQueries({ queryKey: ['incidents'] })
    void queryClient.invalidateQueries({ queryKey: ['me', 'history'] })
  }
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: (body: Schema<'CreateCategoryRequest'>) =>
      api.POST('/admin/categories', { body }).then(unwrapData),
    onSuccess: invalidate,
  })
}

export function useEditCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: ({ id, ...body }: Schema<'EditCategoryRequest'> & { id: number }) =>
      api.PUT('/admin/categories/{id}', { params: { path: { id } }, body }).then(unwrapData),
    onSuccess: invalidate,
  })
}

export function useSetCategoryActive() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      api
        .PATCH('/admin/categories/{id}/active', {
          params: { path: { id } },
          body: { active },
        })
        .then(unwrapEmpty),
    onSuccess: invalidate,
  })
}
