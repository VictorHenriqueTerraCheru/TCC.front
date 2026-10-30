import type { IssueDetail, VoteValue } from './issue'

export function applyVote(d: IssueDetail, value: VoteValue): IssueDetail {
  const previous = d.myVote ?? null
  if (previous === value) return d
  const votes = { ...d.votes }
  if (previous === 'yes') votes.yes--
  if (previous === 'no') {
    votes.no--
    votes.noLast24h = Math.max(0, votes.noLast24h - 1)
  }
  if (value === 'yes') votes.yes++
  else {
    votes.no++
    votes.noLast24h++
  }
  return { ...d, votes, myVote: value }
}
