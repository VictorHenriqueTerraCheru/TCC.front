import { queryOptions, useQuery } from '@tanstack/react-query'

import { api, unwrapData } from '@/infrastructure/api'

const round = (value: number) => Math.round(value * 100_000) / 100_000

export function incidentAreaQuery(lat: number, lng: number) {
  const point = { lat: round(lat), lng: round(lng) }
  return queryOptions({
    queryKey: ['incidents', 'area', point],
    queryFn: ({ signal }) =>
      api.GET('/incidents/area', { params: { query: point }, signal }).then(unwrapData),
  })
}

export function useIncidentArea(lat: number, lng: number) {
  return useQuery(incidentAreaQuery(lat, lng))
}
