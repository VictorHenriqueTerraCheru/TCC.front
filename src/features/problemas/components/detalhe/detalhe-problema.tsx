import type { MaterialSymbol } from 'material-symbols'

import { Icon } from '@/common/components/icone'
import { useResponsivePanel } from '@/common/hooks/use-painel-responsivo'
import { shortTime, relativeTime } from '@/common/lib/formatacao'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { isApiError } from '@/infrastructure/api'

import { useIssueDetail } from '../../api/use-detalhe-problema'
import type { IssueDetail as Detail, IssueStatus } from '../../models/problema'
import { EvaluationBar, TrustBar } from './barras'
import { VoteCard } from './cartoes-voto'
import { AlertSummary } from './resumo-alerta'
import { LocationFooter } from './rodape-localizacao'

const statusChip: Record<
  Exclude<IssueStatus, 'resolved'>,
  { label: string; icon: MaterialSymbol; cssClass: string }
> = {
  active: { label: 'Ativa', icon: 'radio_button_checked', cssClass: 'bg-muted text-foreground' },
  new: { label: 'Em avaliação', icon: 'hourglass_top', cssClass: 'bg-nova/15 text-nova' },
  possiblyResolved: {
    label: 'Possivelmente resolvida',
    icon: 'help',
    cssClass: 'bg-primario-suave text-primario',
  },
}

function StatusChip({ status }: { status: IssueStatus }) {
  if (status === 'resolved') {
    return (
      <span className="rounded-lg bg-primario-suave px-2 py-1 text-xs font-medium text-primario">
        Resolvida
      </span>
    )
  }
  const chip = statusChip[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium',
        chip.cssClass,
      )}
    >
      <Icon name={chip.icon} filled className="text-[16px]" />
      {chip.label}
    </span>
  )
}

function IssueInfo({ issue }: { issue: Detail }) {
  return (
    <div className="mb-4 space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Icon name="schedule" className="text-[20px] text-muted-foreground" />
        <p className="flex-1">
          Registrada {relativeTime(issue.createdAt)} · {shortTime(issue.createdAt)}
        </p>
        <StatusChip status={issue.status} />
      </div>
      {issue.description && <p className="pl-8 text-muted-foreground">{issue.description}</p>}
    </div>
  )
}

function trustLegend({ votes: { yes, no } }: Detail) {
  const votes = yes + no
  return `Calculada com ${votes} ${votes === 1 ? 'voto' : 'votos'}, ponderados por proximidade e histórico de quem votou.`
}

function Body({ issue }: { issue: Detail }) {
  if (issue.status === 'resolved') {
    const { no: resolved } = issue.votes
    return (
      <p className="flex items-start gap-3 rounded-2xl bg-primario-suave p-4 text-sm">
        <Icon name="check_circle" filled className="text-[20px] text-primario" />
        <span>
          A comunidade confirmou que este problema foi resolvido
          {resolved > 0 && ` (${resolved} ${resolved === 1 ? 'voto' : 'votos'})`}. Ele não aparece
          mais no mapa nem recebe votos.
        </span>
      </p>
    )
  }

  if (issue.status === 'new') {
    return (
      <>
        {issue.evaluation && <EvaluationBar evaluation={issue.evaluation} />}
        <VoteCard issue={issue} />
        <LocationFooter point={issue} showDistance={false} />
      </>
    )
  }

  if (issue.status === 'possiblyResolved') {
    return (
      <>
        <VoteCard issue={issue} />
        {issue.trustScore !== null && issue.band && (
          <TrustBar trustScore={issue.trustScore} band={issue.band} legend={trustLegend(issue)} />
        )}
        <LocationFooter point={issue} />
      </>
    )
  }

  return (
    <>
      {issue.trustScore !== null && issue.band && (
        <TrustBar trustScore={issue.trustScore} band={issue.band} legend={trustLegend(issue)} />
      )}
      <VoteCard issue={issue} />
      <LocationFooter point={issue} />
    </>
  )
}

function Loading() {
  return (
    <div aria-label="Carregando problema" className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20 bg-muted" />
          <Skeleton className="h-6 w-40 bg-muted" />
        </div>
      </div>
      <Skeleton className="h-10 bg-muted" />
      <Skeleton className="h-32 rounded-2xl bg-muted" />
    </div>
  )
}

export function IssueDetail({ id }: { id: string }) {
  const { collapsed } = useResponsivePanel()
  const { data: issue, isPending, isError, error, refetch } = useIssueDetail(id)

  if (isPending) return <Loading />
  if (isError) {
    const nonexistent = isApiError(error) && error.status === 404
    return (
      <div role="alert" className="space-y-3 py-6 pr-10">
        <p>
          {nonexistent
            ? 'Este problema não está mais no mapa.'
            : 'Não foi possível carregar o problema.'}
        </p>
        {!nonexistent && (
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        )}
      </div>
    )
  }

  return (
    <article className="space-y-4">
      <AlertSummary issue={issue} />

      <div className={cn('space-y-4 transition-opacity duration-300', collapsed && 'opacity-0')}>
        <IssueInfo issue={issue} />
        <Body issue={issue} />
      </div>
    </article>
  )
}
