import { infiniteQueryOptions, useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { api, dados } from '@/infrastructure/api'

import type { FiltroHistorico } from '../models/historico'

const TAMANHO_PAGINA = 20

export function historicoQuery(filtro: FiltroHistorico) {
  return infiniteQueryOptions({
    queryKey: ['me', 'historico', filtro],
    queryFn: ({ pageParam, signal }) =>
      api
        .GET('/me/history', {
          params: { query: { filter: filtro, page: pageParam, pageSize: TAMANHO_PAGINA } },
          signal,
        })
        .then(dados),
    initialPageParam: 1,
    getNextPageParam: ({ page: pagina, pageSize: tamanho, total }) =>
      pagina * tamanho < total ? pagina + 1 : undefined,
  })
}

export function useHistorico(filtro: FiltroHistorico) {
  return useInfiniteQuery(historicoQuery(filtro))
}

export function useHistoricoResumo() {
  return useQuery({
    queryKey: ['me', 'historico', 'resumo'],
    queryFn: ({ signal }) =>
      api
        .GET('/me/history', { params: { query: { pageSize: 3 } }, signal })
        .then(dados)
        .then(({ items: itens }) => itens),
  })
}
