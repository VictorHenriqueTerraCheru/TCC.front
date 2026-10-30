import { Icon } from '@/common/components/icon'
import { PulsingNumber } from '@/common/components/animated-number'
import { distanceText } from '@/common/lib/formatting'
import { cn } from '@/common/lib/utils'

import { voteErrorMessage } from '../../errors'
import { useDistanceTo } from '../../hooks/use-distance-to'
import { useVotes } from '../../hooks/use-votes'
import type { IssueDetail } from '../../models/issue'
import { VoteButton } from './vote-button'

const AUTHOR_HINT = 'Você registrou este problema'

function people(n: number) {
  return n === 1 ? '1 pessoa disse' : `${n} pessoas disseram`
}

function Invite({ issue }: { issue: IssueDetail }) {
  const distance = useDistanceTo(issue)

  if (issue.status === 'new') {
    return (
      <div className="mb-1 flex items-start gap-3">
        <Icon name="near_me" filled className="mt-0.5 text-[20px]" />
        <div>
          <h3 className="font-medium">
            {distance !== null
              ? `Você está a ${distanceText(distance)}. Ainda está lá?`
              : 'Ainda está lá?'}
          </h3>
          <p className="text-sm">Quem está perto ajuda mais a avaliar registros novos.</p>
        </div>
      </div>
    )
  }

  if (issue.status === 'possiblyResolved') {
    return (
      <>
        <h3 className="mb-2 text-2xl">Ainda está lá?</h3>
        <p className="text-sm">
          {people(issue.votes.noLast24h)} que não está mais lá nas últimas 24 h. Se você passou por
          lá, ajude a confirmar.
        </p>
      </>
    )
  }

  return <h3 className="font-medium">Ainda está lá?</h3>
}

export function VoteCard({ issue }: { issue: IssueDetail }) {
  const { error, vote, myVote, voting, canVote } = useVotes(issue)
  const highlight = issue.status !== 'active'
  const { yes, no } = issue.votes

  return (
    <section
      className={cn(
        'rounded-2xl p-4',
        highlight ? 'bg-primario-suave text-primario' : 'border border-border/60 bg-card',
      )}
    >
      <Invite issue={issue} />
      <p className={cn('mt-2 text-xs', highlight ? 'font-medium' : 'text-muted-foreground')}>
        <PulsingNumber value={yes} className={cn('text-2xl', !highlight && 'text-foreground')} />{' '}
        sim{' '}
        <PulsingNumber
          value={no}
          className={cn('ml-2 text-2xl', !highlight && 'text-foreground')}
        />{' '}
        não
      </p>
      {canVote ? (
        <div className="mt-3 flex gap-2">
          <VoteButton
            className="flex-1"
            variant={highlight ? 'default' : 'tonal'}
            selected={myVote === 'yes'}
            disabled={voting}
            onClick={() => vote('yes')}
          >
            Sim, está lá
          </VoteButton>
          <VoteButton
            className={cn('flex-1', highlight && 'border-primario/40 text-primario')}
            variant="outline"
            selected={myVote === 'no'}
            disabled={voting}
            onClick={() => vote('no')}
          >
            Não está lá
          </VoteButton>
        </div>
      ) : (
        issue.isAuthor && (
          <p className={cn('mt-2 text-xs', !highlight && 'text-muted-foreground')}>{AUTHOR_HINT}</p>
        )
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {voteErrorMessage(error)}
        </p>
      )}
    </section>
  )
}
