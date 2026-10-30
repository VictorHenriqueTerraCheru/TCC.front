import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'

import { api, unwrapData } from '@/infrastructure/api'

import type { Point } from '../stores/draft-store'

const SUBMIT_TIMEOUT_MS = 20_000

export function duplicatesQuery(categoryId: number, { lat, lng }: Point) {
  return queryOptions({
    queryKey: ['issues', 'duplicates', { categoryId, lat, lng }],
    queryFn: ({ signal }) =>
      api
        .GET('/issues/duplicates', {
          params: { query: { categoryId, lat, lng } },
          signal,
        })
        .then(unwrapData),
    staleTime: 60_000,
  })
}

interface NewIssue extends Point {
  categoryId: number
  description: string
}

export function useReportIssue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, lat, lng, description }: NewIssue) =>
      api
        .POST('/issues', {
          body: { categoryId, lat, lng, description: description.trim() || null },
          signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
        })
        .then(unwrapData),
    onSuccess: (detail) => {
      queryClient.setQueryData(['issues', 'detail', detail.id], detail)
      void queryClient.invalidateQueries({ queryKey: ['issues', 'area'] })
    },
  })
}

interface NewIncident extends Point {
  categoryId: number
  occurredAt: Date
}

export function useReportIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, lat, lng, occurredAt }: NewIncident) =>
      api
        .POST('/incidents', {
          body: { categoryId, lat, lng, occurredAt: occurredAt.toISOString() },
          signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
        })
        .then(unwrapData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incidents'] }),
  })
}
