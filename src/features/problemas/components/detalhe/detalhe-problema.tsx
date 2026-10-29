import type { MaterialSymbol } from 'material-symbols'

import { Icone } from '@/common/components/icone'
import { usePainelResponsivo } from '@/common/hooks/use-painel-responsivo'
import { horaCurta, tempoRelativo } from '@/common/lib/formatacao'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { isApiError } from '@/infrastructure/api'

import { useDetalheProblema } from '../../api/use-detalhe-problema'
import type { DetalheProblema as Detalhe, StatusProblema } from '../../models/problema'
import { BarraAvaliacao, BarraConfianca } from './barras'
import { CartaoVoto } from './cartoes-voto'
import { ResumoAlerta } from './resumo-alerta'
import { RodapeLocalizacao } from './rodape-localizacao'

const chipStatus: Record<
  Exclude<StatusProblema, 'resolved'>,
  { label: string; icon: MaterialSymbol; classe: string }
> = {
  active: { label: 'Ativa', icon: 'radio_button_checked', classe: 'bg-muted text-foreground' },
  new: { label: 'Em avaliação', icon: 'hourglass_top', classe: 'bg-nova/15 text-nova' },
  possiblyResolved: {
    label: 'Possivelmente resolvida',
    icon: 'help',
    classe: 'bg-primario-suave text-primario',
  },
}

function ChipStatus({ status }: { status: StatusProblema }) {
  if (status === 'resolved') {
    return (
      <span className="rounded-lg bg-primario-suave px-2 py-1 text-xs font-medium text-primario">
        Resolvida
      </span>
    )
  }
  const chip = chipStatus[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium',
        chip.classe,
      )}
    >
      <Icone name={chip.icon} preenchido className="text-[16px]" />
      {chip.label}
    </span>
  )
}

function Informacoes({ issue: problema }: { issue: Detalhe }) {
  return (
    <div className="mb-4 space-y-3 text-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Icone name="schedule" className="text-[20px] text-muted-foreground" />
        <p className="flex-1">
          Registrada {tempoRelativo(problema.createdAt)} · {horaCurta(problema.createdAt)}
        </p>
        <ChipStatus status={problema.status} />
      </div>
      {problema.description && <p className="pl-8 text-muted-foreground">{problema.description}</p>}
    </div>
  )
}

function legendaConfianca({ votes: { yes: sim, no: nao } }: Detalhe) {
  const votos = sim + nao
  return `Calculada com ${votos} ${votos === 1 ? 'voto' : 'votos'}, ponderados por proximidade e histórico de quem votou.`
}

function Corpo({ issue: problema }: { issue: Detalhe }) {
  if (problema.status === 'resolved') {
    const { no: resolvido } = problema.votes
    return (
      <p className="flex items-start gap-3 rounded-2xl bg-primario-suave p-4 text-sm">
        <Icone name="check_circle" preenchido className="text-[20px] text-primario" />
        <span>
          A comunidade confirmou que este problema foi resolvido
          {resolvido > 0 && ` (${resolvido} ${resolvido === 1 ? 'voto' : 'votos'})`}. Ele não
          aparece mais no mapa nem recebe votos.
        </span>
      </p>
    )
  }

  if (problema.status === 'new') {
    return (
      <>
        {problema.evaluation && <BarraAvaliacao evaluation={problema.evaluation} />}
        <CartaoVoto issue={problema} />
        <RodapeLocalizacao ponto={problema} mostrarDistancia={false} />
      </>
    )
  }

  if (problema.status === 'possiblyResolved') {
    return (
      <>
        <CartaoVoto issue={problema} />
        {problema.trustScore !== null && problema.band && (
          <BarraConfianca
            trustScore={problema.trustScore}
            band={problema.band}
            legenda={legendaConfianca(problema)}
          />
        )}
        <RodapeLocalizacao ponto={problema} />
      </>
    )
  }

  return (
    <>
      {problema.trustScore !== null && problema.band && (
        <BarraConfianca
          trustScore={problema.trustScore}
          band={problema.band}
          legenda={legendaConfianca(problema)}
        />
      )}
      <CartaoVoto issue={problema} />
      <RodapeLocalizacao ponto={problema} />
    </>
  )
}

function Carregando() {
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

export function DetalheProblema({ id }: { id: string }) {
  const { recolhido } = usePainelResponsivo()
  const { data: problema, isPending, isError, error, refetch } = useDetalheProblema(id)

  if (isPending) return <Carregando />
  if (isError) {
    const naoExiste = isApiError(error) && error.status === 404
    return (
      <div role="alert" className="space-y-3 py-6 pr-10">
        <p>
          {naoExiste
            ? 'Este problema não está mais no mapa.'
            : 'Não foi possível carregar o problema.'}
        </p>
        {!naoExiste && (
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        )}
      </div>
    )
  }

  return (
    <article className="space-y-4">
      <ResumoAlerta issue={problema} />

      <div className={cn('space-y-4 transition-opacity duration-300', recolhido && 'opacity-0')}>
        <Informacoes issue={problema} />
        <Corpo issue={problema} />
      </div>
    </article>
  )
}
