import { useIsMutating } from '@tanstack/react-query'

import { useRequireAccount } from '@/features/auth'

import { votesKey, useVote } from '../api/use-vote'
import type { IssueDetail, VoteValue } from '../models/issue'

export function useVotes(issue: IssueDetail) {
  const requireAccount = useRequireAccount()
  const mutation = useVote(issue.id, () => requireAccount('vote', () => {}))
  const pendingVotes = useIsMutating({ mutationKey: votesKey(issue.id) })

  function vote(value: VoteValue) {
    requireAccount('vote', () => mutation.mutate(value))
  }

  return {
    error: mutation.error,
    voting: pendingVotes > 0,
    myVote: issue.myVote ?? null,
    canVote: !issue.isAuthor && issue.status !== 'resolved',
    vote,
  }
}
