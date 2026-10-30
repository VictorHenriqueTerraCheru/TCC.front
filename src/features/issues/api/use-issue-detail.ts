import { queryOptions, useQuery } from '@tanstack/react-query'

import { api, unwrapData } from '@/infrastructure/api'

export function issueDetailQuery(id: string) {
  return queryOptions({
    queryKey: ['issues', 'detail', id],
    queryFn: ({ signal }) =>
      api.GET('/issues/{id}', { params: { path: { id } }, signal }).then(unwrapData),
  })
}

export function useIssueDetail(id: string) {
  return useQuery(issueDetailQuery(id))
}
