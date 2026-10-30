import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'

import { api, unwrapData } from '@/infrastructure/api'

export interface IncidentHeatmapFilter {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
  groups: string[]
  days: number
}

export function incidentHeatmapQuery({ groups, days, ...bounds }: IncidentHeatmapFilter) {
  return queryOptions({
    queryKey: ['incidents', 'heatmap', bounds, { groups, days }],
    queryFn: ({ signal }) =>
      api
        .GET('/incidents/heatmap', {
          params: {
            query: { ...bounds, days, groups: groups.length ? groups.join(',') : undefined },
          },
          signal,
        })
        .then(unwrapData),
  })
}

export function useIncidentHeatmap(filter: IncidentHeatmapFilter | null) {
  return useQuery({
    ...incidentHeatmapQuery(
      filter ?? { minLat: 0, minLng: 0, maxLat: 0, maxLng: 0, groups: [], days: 7 },
    ),
    enabled: filter !== null,
    placeholderData: keepPreviousData,
  })
}
