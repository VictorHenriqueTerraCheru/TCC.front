import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api, unwrapData, unwrapEmpty, type Schema } from '@/infrastructure/api'

function useInvalidateGroups() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['groups'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    void queryClient.invalidateQueries({ queryKey: ['issues'] })
    void queryClient.invalidateQueries({ queryKey: ['incidents'] })
  }
}

export function useCreateGroup() {
  const invalidate = useInvalidateGroups()
  return useMutation({
    mutationFn: (body: Schema<'CreateGroupRequest'>) =>
      api.POST('/admin/groups', { body }).then(unwrapData),
    onSuccess: invalidate,
  })
}

export function useEditGroup() {
  const invalidate = useInvalidateGroups()
  return useMutation({
    mutationFn: ({ key, ...body }: Schema<'EditGroupRequest'> & { key: string }) =>
      api.PUT('/admin/groups/{key}', { params: { path: { key } }, body }).then(unwrapData),
    onSuccess: invalidate,
  })
}

export function useDeleteGroup() {
  const invalidate = useInvalidateGroups()
  return useMutation({
    mutationFn: (key: string) =>
      api.DELETE('/admin/groups/{key}', { params: { path: { key } } }).then(unwrapEmpty),
    onSuccess: invalidate,
  })
}
