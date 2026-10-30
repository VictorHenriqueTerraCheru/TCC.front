import { infiniteQueryOptions, useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { api, unwrapData } from '@/infrastructure/api'

import type { HistoryFilter } from '../models/history'

const PAGE_SIZE = 20

export function historyQuery(filter: HistoryFilter) {
  return infiniteQueryOptions({
    queryKey: ['me', 'history', filter],
    queryFn: ({ pageParam, signal }) =>
      api
        .GET('/me/history', {
          params: { query: { filter, page: pageParam, pageSize: PAGE_SIZE } },
          signal,
        })
        .then(unwrapData),
    initialPageParam: 1,
    getNextPageParam: ({ page, pageSize: size, total }) =>
      page * size < total ? page + 1 : undefined,
  })
}

export function useHistory(filter: HistoryFilter) {
  return useInfiniteQuery(historyQuery(filter))
}

export function useHistorySummary() {
  return useQuery({
    queryKey: ['me', 'history', 'summary'],
    queryFn: ({ signal }) =>
      api
        .GET('/me/history', { params: { query: { pageSize: 3 } }, signal })
        .then(unwrapData)
        .then(({ items }) => items),
  })
}
