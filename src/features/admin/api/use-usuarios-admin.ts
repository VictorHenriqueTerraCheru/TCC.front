import {
  infiniteQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import type { Role } from '@/features/usuarios'
import { api, unwrapEmpty, unwrapData, type Schema } from '@/infrastructure/api'

const PAGE_SIZE = 20

export type AdminUser = Schema<'ListUsersItem'>

export interface UserFilter {
  search: string
  role: Role | null
}

export function adminUsersQuery({ search, role }: UserFilter) {
  return infiniteQueryOptions({
    queryKey: ['admin', 'users', { search, role }],
    queryFn: ({ pageParam, signal }) =>
      api
        .GET('/admin/users', {
          params: {
            query: {
              search: search || undefined,
              role: role ?? undefined,
              page: pageParam,
              pageSize: PAGE_SIZE,
            },
          },
          signal,
        })
        .then(unwrapData),
    initialPageParam: 1,
    getNextPageParam: ({ page, pageSize: size, total }) =>
      page * size < total ? page + 1 : undefined,
  })
}

export function useAdminUsers(filter: UserFilter) {
  return useInfiniteQuery(adminUsersQuery(filter))
}

export function useSetUserRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      api
        .PATCH('/admin/users/{id}/role', { params: { path: { id } }, body: { role } })
        .then(unwrapEmpty),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}
