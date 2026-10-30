import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'

import { api, unwrapData } from '@/infrastructure/api'

import type { IssueStatus } from '../models/issue'

export interface IssuesInAreaFilter {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
  groups: string[]
  status: IssueStatus[]
}

export function issuesInAreaQuery({ groups, status, ...bounds }: IssuesInAreaFilter) {
  return queryOptions({
    queryKey: ['issues', 'area', bounds, { groups, status }],
    queryFn: ({ signal }) =>
      api
        .GET('/issues', {
          params: {
            query: {
              ...bounds,
              groups: groups.length ? groups.join(',') : undefined,
              status: status.length ? status.join(',') : undefined,
            },
          },
          signal,
        })
        .then(unwrapData),
  })
}

export function useIssuesInArea(filter: IssuesInAreaFilter | null) {
  return useQuery({
    ...issuesInAreaQuery(
      filter ?? { minLat: 0, minLng: 0, maxLat: 0, maxLng: 0, groups: [], status: [] },
    ),
    enabled: filter !== null,
    placeholderData: keepPreviousData,
  })
}
