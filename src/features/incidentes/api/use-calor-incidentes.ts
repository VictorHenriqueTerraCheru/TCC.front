import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'

import { api, dados } from '@/infrastructure/api'

export interface FiltroCalorIncidentes {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
  grupos: string[]
  dias: number
}

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

export function useCalorIncidentes(filtro: FiltroCalorIncidentes | null) {
  return useQuery({
    ...calorIncidentesQuery(
      filtro ?? { minLat: 0, minLng: 0, maxLat: 0, maxLng: 0, grupos: [], dias: 7 },
    ),
    enabled: filtro !== null,
    placeholderData: keepPreviousData,
  })
}
