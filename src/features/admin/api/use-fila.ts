import {
  infiniteQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { meQuery } from '@/features/usuarios'
import type { StatusVerificacao } from '@/features/verificacao'
import { api, dados, semConteudo } from '@/infrastructure/api'

const TAMANHO_PAGINA = 20

export function filaQuery(status: StatusVerificacao) {
  return infiniteQueryOptions({
    queryKey: ['admin', 'verificacoes', status],
    queryFn: ({ pageParam, signal }) =>
      api
        .GET('/admin/verifications', {
          params: { query: { status, page: pageParam, pageSize: TAMANHO_PAGINA } },
          signal,
        })
        .then(dados),
    initialPageParam: 1,
    getNextPageParam: ({ page: pagina, pageSize: tamanho, total }) =>
      pagina * tamanho < total ? pagina + 1 : undefined,
  })
}

export function useFila(status: StatusVerificacao) {
  return useInfiniteQuery(filaQuery(status))
}

type Analise =
  { id: string; decisao: 'aprovar' } | { id: string; decisao: 'recusar'; reason: string }

export function useAnalisarVerificacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (analise: Analise) =>
      analise.decisao === 'aprovar'
        ? api
            .POST('/admin/verifications/{id}/approve', { params: { path: { id: analise.id } } })
            .then(semConteudo)
        : api
            .POST('/admin/verifications/{id}/reject', {
              params: { path: { id: analise.id } },
              body: { reason: analise.reason },
            })
            .then(semConteudo),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'verificacoes'] })
      void queryClient.invalidateQueries({ queryKey: meQuery.queryKey })
    },
  })
}
