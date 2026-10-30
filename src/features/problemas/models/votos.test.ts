import type { IssueDetail } from './problema'
import { applyVote } from './votos'

const base = {
  votes: { yes: 15, no: 1, noLast24h: 1 },
  myVote: null,
} as IssueDetail

describe('optimistic votes', () => {
  it('first vote goes into the chosen bucket', () => {
    const d = applyVote(base, 'yes')
    expect(d.votes).toEqual({ yes: 16, no: 1, noLast24h: 1 })
    expect(d.myVote).toBe('yes')
  })

  it('changing the vote removes it from the previous bucket', () => {
    const d = applyVote(applyVote(base, 'yes'), 'no')
    expect(d.votes).toEqual({ yes: 15, no: 2, noLast24h: 2 })
    expect(d.myVote).toBe('no')
  })

  it('repeating the same vote changes nothing', () => {
    const one = applyVote(base, 'no')
    expect(applyVote(one, 'no')).toBe(one)
  })
})
