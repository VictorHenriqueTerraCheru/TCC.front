import { useIsMutating } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useAuthenticated, useConsumePendingAction, useRequireAccount } from '@/features/auth'
import { isApiError } from '@/infrastructure/api'

import { votesKey, useVote } from '../api/use-votar'
import type { IssueDetail, VoteValue } from '../models/problema'

export function useVotes(issue: IssueDetail) {
  const requireAccount = useRequireAccount()
  const consumeAction = useConsumePendingAction()
  const authenticated = useAuthenticated()
  const mutation = useVote(issue.id)
  const pendingVotes = useIsMutating({ mutationKey: votesKey(issue.id) })

  const mutate = mutation.mutate
  useEffect(() => {
    if (!authenticated) return
    const action = consumeAction((a) => 'issueId' in a && a.issueId === issue.id)
    if (action?.type === 'vote') mutate(action.value)
  }, [authenticated, consumeAction, issue.id, mutate])

  function vote(value: VoteValue) {
    const pending = { type: 'vote', issueId: issue.id, value } as const
    const reopenGuardIfExpired = (error: unknown) => {
      if (isApiError(error) && error.status === 401) requireAccount('vote', () => {}, { pending })
    }
    requireAccount('vote', () => mutation.mutate(value, { onError: reopenGuardIfExpired }), {
      pending,
    })
  }

  return {
    error: mutation.error,
    voting: pendingVotes > 0,
    myVote: issue.myVote ?? null,
    canVote: !issue.isAuthor && issue.status !== 'resolved',
    vote,
  }
}
