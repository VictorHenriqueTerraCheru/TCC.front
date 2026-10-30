import {
  infiniteQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { meQuery } from '@/features/users'
import type { VerificationStatus } from '@/features/verification'
import { api, unwrapData, unwrapEmpty } from '@/infrastructure/api'

const PAGE_SIZE = 20

export function queueQuery(status: VerificationStatus) {
  return infiniteQueryOptions({
    queryKey: ['admin', 'verifications', status],
    queryFn: ({ pageParam, signal }) =>
      api
        .GET('/admin/verifications', {
          params: { query: { status, page: pageParam, pageSize: PAGE_SIZE } },
          signal,
        })
        .then(unwrapData),
    initialPageParam: 1,
    getNextPageParam: ({ page, pageSize: size, total }) =>
      page * size < total ? page + 1 : undefined,
  })
}

export function useQueue(status: VerificationStatus) {
  return useInfiniteQuery(queueQuery(status))
}

type Review =
  { id: string; decision: 'approve' } | { id: string; decision: 'reject'; reason: string }

export function useReviewVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (review: Review) =>
      review.decision === 'approve'
        ? api
            .POST('/admin/verifications/{id}/approve', { params: { path: { id: review.id } } })
            .then(unwrapEmpty)
        : api
            .POST('/admin/verifications/{id}/reject', {
              params: { path: { id: review.id } },
              body: { reason: review.reason },
            })
            .then(unwrapEmpty),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] })
      void queryClient.invalidateQueries({ queryKey: meQuery.queryKey })
    },
  })
}
