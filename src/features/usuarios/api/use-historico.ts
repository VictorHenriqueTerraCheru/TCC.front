import { infiniteQueryOptions, useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { api, dados } from '@/infrastructure/api'

import type { FiltroHistorico } from '../models/historico'

const TAMANHO_PAGINA = 20

export function historicoQuery(filtro: FiltroHistorico) {
  return infiniteQueryOptions({
    queryKey: ['me', 'historico', filtro],
    queryFn: ({ pageParam, signal }) =>
      api
        .GET('/me/historico', {
          params: { query: { filtro, pagina: pageParam, tamanho: TAMANHO_PAGINA } },
          signal,
        })
        .then(dados),
    initialPageParam: 1,
    getNextPageParam: ({ pagina, tamanho, total }) =>
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
        .GET('/me/historico', { params: { query: { tamanho: 3 } }, signal })
        .then(dados)
        .then(({ itens }) => itens),
  })
}
