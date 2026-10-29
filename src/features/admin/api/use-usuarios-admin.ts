import {
  infiniteQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import type { Perfil } from '@/features/usuarios'
import { api, semConteudo, dados, type Schema } from '@/infrastructure/api'

const TAMANHO_PAGINA = 20

export type UsuarioAdmin = Schema<'ListarUsuariosItem'>

export interface FiltroUsuarios {
  busca: string
  perfil: Perfil | null
}

export function usuariosAdminQuery({ busca, perfil }: FiltroUsuarios) {
  return infiniteQueryOptions({
    queryKey: ['admin', 'usuarios', { busca, perfil }],
    queryFn: ({ pageParam, signal }) =>
      api
        .GET('/admin/usuarios', {
          params: {
            query: {
              busca: busca || undefined,
              perfil: perfil ?? undefined,
              pagina: pageParam,
              tamanho: TAMANHO_PAGINA,
            },
          },
          signal,
        })
        .then(dados),
    initialPageParam: 1,
    getNextPageParam: ({ pagina, tamanho, total }) =>
      pagina * tamanho < total ? pagina + 1 : undefined,
  })
}

export function useUsuariosAdmin(filtro: FiltroUsuarios) {
  return useInfiniteQuery(usuariosAdminQuery(filtro))
}

export function useAlterarPerfilUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, perfil }: { id: string; perfil: Perfil }) =>
      api
        .PATCH('/admin/usuarios/{id}/perfil', { params: { path: { id } }, body: { perfil } })
        .then(semConteudo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] }),
  })
}
