import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

import { api, unwrapData } from '@/infrastructure/api'

const PAGE_SIZE = 20
export const RECENT_RADIUS_KM = 10

const round = (value: number) => Math.round(value * 1000) / 1000

export function recentQuery(center: { lat: number; lng: number }, groups: string[]) {
  const point = { lat: round(center.lat), lng: round(center.lng) }
  return infiniteQueryOptions({
    queryKey: ['issues', 'recentes', point, { groups }],
    queryFn: ({ pageParam, signal }) =>
      api
        .GET('/issues/recent', {
          params: {
            query: {
              ...point,
              radiusKm: RECENT_RADIUS_KM,
              groups: groups.length ? groups.join(',') : undefined,
              page: pageParam,
              pageSize: PAGE_SIZE,
            },
          },
          signal,
        })
        .then(unwrapData),
    initialPageParam: 1,
    getNextPageParam: ({ page, pageSize: size, total }) =>
      page * size < total ? page + 1 : undefined,
  })
}

export function useRecent(center: { lat: number; lng: number }, groups: string[]) {
  return useInfiniteQuery(recentQuery(center, groups))
}
