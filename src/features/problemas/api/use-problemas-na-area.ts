import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'

import type { GrupoCategoria } from '@/features/categorias'
import { api, dados } from '@/infrastructure/api'

import type { StatusProblema } from '../models/problema'

export interface FiltroProblemasNaArea {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
  /** Vazio = todos os grupos. */
  grupos: GrupoCategoria[]
  /** Vazio = todos os não resolvidos. */
  status: StatusProblema[]
}

// GET /problemas — marcadores do retângulo visível (já limitado e arredondado pelo mapa).
export function problemasNaAreaQuery({ grupos, status, ...retangulo }: FiltroProblemasNaArea) {
  return queryOptions({
    queryKey: ['problemas', 'area', retangulo, { grupos, status }],
    queryFn: ({ signal }) =>
      api
        .GET('/problemas', {
          params: {
            query: {
              ...retangulo,
              grupos: grupos.length ? grupos.join(',') : undefined,
              status: status.length ? status.join(',') : undefined,
            },
          },
          signal,
        })
        .then(dados),
  })
}

/** `filtro` null = camada desligada (modo Incidentes ou mapa ainda sem retângulo). */
export function useProblemasNaArea(filtro: FiltroProblemasNaArea | null) {
  return useQuery({
    ...problemasNaAreaQuery(
      filtro ?? { minLat: 0, minLng: 0, maxLat: 0, maxLng: 0, grupos: [], status: [] },
    ),
    enabled: filtro !== null,
    // Ao arrastar, os marcadores antigos ficam até chegarem os novos (sem piscar).
    placeholderData: keepPreviousData,
  })
}
