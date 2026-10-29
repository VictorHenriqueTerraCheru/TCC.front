import { queryOptions, useQuery } from '@tanstack/react-query'

import { api, dados } from '@/infrastructure/api'

const arredondar = (valor: number) => Math.round(valor * 100_000) / 100_000

export function areaIncidentesQuery(lat: number, lng: number) {
  const ponto = { lat: arredondar(lat), lng: arredondar(lng) }
  return queryOptions({
    queryKey: ['incidentes', 'area', ponto],
    queryFn: ({ signal }) =>
      api.GET('/incidentes/area', { params: { query: ponto }, signal }).then(dados),
  })
}

export function useAreaIncidentes(lat: number, lng: number) {
  return useQuery(areaIncidentesQuery(lat, lng))
}
