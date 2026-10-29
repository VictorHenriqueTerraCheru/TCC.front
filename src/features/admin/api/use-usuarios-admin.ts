import {
  infiniteQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import type { Perfil } from '@/features/usuarios'
import { api, semConteudo, dados, type Schema } from '@/infrastructure/api'

const TAMANHO_PAGINA = 20

export type UsuarioAdmin = Schema<'ListUsersItem'>

export interface FiltroUsuarios {
  busca: string
  role: Perfil | null
}

export function usuariosAdminQuery({ busca, role: perfil }: FiltroUsuarios) {
  return infiniteQueryOptions({
    queryKey: ['admin', 'usuarios', { busca, role: perfil }],
    queryFn: ({ pageParam, signal }) =>
      api
        .GET('/admin/users', {
          params: {
            query: {
              search: busca || undefined,
              role: perfil ?? undefined,
              page: pageParam,
              pageSize: TAMANHO_PAGINA,
            },
          },
          signal,
        })
        .then(dados),
    initialPageParam: 1,
    getNextPageParam: ({ page: pagina, pageSize: tamanho, total }) =>
      pagina * tamanho < total ? pagina + 1 : undefined,
  })
}

export function useUsuariosAdmin(filtro: FiltroUsuarios) {
  return useInfiniteQuery(usuariosAdminQuery(filtro))
}

export function useAlterarPerfilUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role: perfil }: { id: string; role: Perfil }) =>
      api
        .PATCH('/admin/users/{id}/role', { params: { path: { id } }, body: { role: perfil } })
        .then(semConteudo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] }),
  })
}
