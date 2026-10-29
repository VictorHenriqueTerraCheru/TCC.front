import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'

import { api, dados } from '@/infrastructure/api'

import type { StatusProblema } from '../models/problema'

export interface FiltroProblemasNaArea {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
  grupos: string[]
  status: StatusProblema[]
}

export function problemasNaAreaQuery({ grupos, status, ...retangulo }: FiltroProblemasNaArea) {
  return queryOptions({
    queryKey: ['problemas', 'area', retangulo, { grupos, status }],
    queryFn: ({ signal }) =>
      api
        .GET('/issues', {
          params: {
            query: {
              ...retangulo,
              groups: grupos.length ? grupos.join(',') : undefined,
              status: status.length ? status.join(',') : undefined,
            },
          },
          signal,
        })
        .then(dados),
  })
}

export function useProblemasNaArea(filtro: FiltroProblemasNaArea | null) {
  return useQuery({
    ...problemasNaAreaQuery(
      filtro ?? { minLat: 0, minLng: 0, maxLat: 0, maxLng: 0, grupos: [], status: [] },
    ),
    enabled: filtro !== null,
    placeholderData: keepPreviousData,
  })
}
