import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useGeolocation } from '@/features/location'
import { api, isApiError, unwrapData } from '@/infrastructure/api'

import type { VoteValue } from '../models/issue'
import { applyVote } from '../models/votes'
import { issueDetailQuery } from './use-issue-detail'

function useVoteCoordinates() {
  const { state, position } = useGeolocation()
  return () =>
    state === 'granted' && position
      ? { lat: position.lat, lng: position.lng }
      : { lat: null, lng: null }
}

export const votesKey = (id: string) => ['votes', id] as const

export function useVote(id: string, onUnauthorized: () => void) {
  const queryClient = useQueryClient()
  const coordinates = useVoteCoordinates()
  const { queryKey } = issueDetailQuery(id)

  return useMutation({
    mutationKey: votesKey(id),
    mutationFn: (value: VoteValue) =>
      api
        .PUT('/issues/{id}/vote', {
          params: { path: { id } },
          body: { value, ...coordinates() },
        })
        .then(unwrapData),
    onMutate: async (value) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)
      if (previous) queryClient.setQueryData(queryKey, applyVote(previous, value))
      return { previous }
    },
    onError: (error, _value, context) => {
      if (isApiError(error) && error.status === 401) onUnauthorized()
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
      void queryClient.invalidateQueries({ queryKey })
    },
    onSuccess: (detail) => queryClient.setQueryData(queryKey, detail),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['issues', 'area'] }),
  })
}
