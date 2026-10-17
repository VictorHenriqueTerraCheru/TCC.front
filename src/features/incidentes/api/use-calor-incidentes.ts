import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'

import type { GrupoCategoria } from '@/features/categorias'
import { api, dados } from '@/infrastructure/api'

export interface FiltroCalorIncidentes {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
  /** Vazio = todos os grupos de incidente. */
  grupos: GrupoCategoria[]
  dias: number
}

// GET /incidentes/calor — células agregadas do retângulo visível.
export function calorIncidentesQuery({ grupos, dias, ...retangulo }: FiltroCalorIncidentes) {
  return queryOptions({
    queryKey: ['incidentes', 'calor', retangulo, { grupos, dias }],
    queryFn: ({ signal }) =>
      api
        .GET('/incidentes/calor', {
          params: {
            query: { ...retangulo, dias, grupos: grupos.length ? grupos.join(',') : undefined },
          },
          signal,
        })
        .then(dados),
  })
}

/** `filtro` null = camada desligada (modo Problemas ou mapa ainda sem retângulo). */
export function useCalorIncidentes(filtro: FiltroCalorIncidentes | null) {
  return useQuery({
    ...calorIncidentesQuery(
      filtro ?? { minLat: 0, minLng: 0, maxLat: 0, maxLng: 0, grupos: [], dias: 7 },
    ),
    enabled: filtro !== null,
    placeholderData: keepPreviousData,
  })
}
