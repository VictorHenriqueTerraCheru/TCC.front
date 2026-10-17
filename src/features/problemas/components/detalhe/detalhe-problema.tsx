import type { MaterialSymbol } from 'material-symbols'

import { Icone } from '@/common/components/icone'
import { horaCurta, tempoRelativo } from '@/common/lib/formatacao'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { isApiError } from '@/infrastructure/api'

import { useDetalheProblema } from '../../api/use-detalhe-problema'
import type { DetalheProblema as Detalhe, StatusProblema } from '../../models/problema'
import { BarraAvaliacao, BarraConfianca } from './barras'
import { CartaoAindaEstaLa, CartaoAvaliarNova, CartoesAtiva } from './cartoes-voto'
import { ResumoAlerta } from './resumo-alerta'
import { RodapeLocalizacao } from './rodape-localizacao'

const chipStatus: Record<
  Exclude<StatusProblema, 'resolvida'>,
  { rotulo: string; icone: MaterialSymbol; classe: string }
> = {
  ativa: { rotulo: 'Ativa', icone: 'radio_button_checked', classe: 'bg-muted text-foreground' },
  nova: { rotulo: 'Em avaliação', icone: 'hourglass_top', classe: 'bg-nova/15 text-nova' },
  possivelmenteResolvida: {
    rotulo: 'Possivelmente resolvida',
    icone: 'help',
    classe: 'bg-primario-suave text-primario',
  },
}

function ChipStatus({ status }: { status: StatusProblema }) {
  if (status === 'resolvida') {
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
      <Icone nome={chip.icone} preenchido className="text-[16px]" />
      {chip.rotulo}
    </span>
  )
}

function Informacoes({ problema }: { problema: Detalhe }) {
  return (
    <div className="mb-4 space-y-3 text-sm">
      <div className="flex gap-3">
        <Icone nome="location_on" className="text-[20px] text-muted-foreground" />
        <div>
          <p>{problema.endereco}</p>
          <p className="text-xs text-muted-foreground">Endereço aproximado</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Icone nome="schedule" className="text-[20px] text-muted-foreground" />
        <p className="flex-1">
          Registrada {tempoRelativo(problema.criadoEm)} · {horaCurta(problema.criadoEm)}
        </p>
        <ChipStatus status={problema.status} />
      </div>
      {problema.descricao && <p className="pl-8 text-muted-foreground">{problema.descricao}</p>}
    </div>
  )
}

function legendaConfianca({ existencia }: Detalhe) {
  const votos = existencia.confirmacoes + existencia.naoVi
  return `Calculada com ${votos} ${votos === 1 ? 'voto' : 'votos'}, ponderados por proximidade e histórico de quem votou.`
}

/** Corpo por status: Ativa (tela 3), Nova (22), Possivelmente resolvida (23) e Resolvida. */
function Corpo({ problema }: { problema: Detalhe }) {
  // Resolvida sai do mapa, mas o detalhe ainda abre por link salvo ou logo após o voto que a
  // resolveu. A API recusa votos nesse estado (problema-resolvido): só leitura.
  if (problema.status === 'resolvida') {
    const { resolvido } = problema.persistencia
    return (
      <p className="flex items-start gap-3 rounded-2xl bg-primario-suave p-4 text-sm">
        <Icone nome="check_circle" preenchido className="text-[20px] text-primario" />
        <span>
          A comunidade confirmou que este problema foi resolvido
          {resolvido > 0 && ` (${resolvido} ${resolvido === 1 ? 'voto' : 'votos'})`}. Ele não
          aparece mais no mapa nem recebe votos.
        </span>
      </p>
    )
  }

  if (problema.status === 'nova') {
    const { confirmacoes } = problema.existencia
    return (
      <>
        {problema.avaliacao && <BarraAvaliacao avaliacao={problema.avaliacao} />}
        <CartaoAvaliarNova problema={problema} />
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Icone nome="group" className="text-[16px]" />
          {confirmacoes} {confirmacoes === 1 ? 'confirmação' : 'confirmações'} de existência ·
          "Ainda está lá?" abre após a avaliação
        </p>
        <RodapeLocalizacao ponto={problema} mostrarDistancia={false} />
      </>
    )
  }

  if (problema.status === 'possivelmenteResolvida') {
    const { confirmacoes } = problema.existencia
    return (
      <>
        <CartaoAindaEstaLa problema={problema} />
        {problema.confianca !== null && problema.faixa && (
          <BarraConfianca
            confianca={problema.confianca}
            faixa={problema.faixa}
            legenda={`${confirmacoes} ${confirmacoes === 1 ? 'confirmação' : 'confirmações'} de existência`}
          />
        )}
        <RodapeLocalizacao ponto={problema} />
      </>
    )
  }

  return (
    <>
      {problema.confianca !== null && problema.faixa && (
        <BarraConfianca
          confianca={problema.confianca}
          faixa={problema.faixa}
          legenda={legendaConfianca(problema)}
        />
      )}
      <CartoesAtiva problema={problema} />
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
      {/* No celular, a folha abre só com o resumo (ALTURA_RESUMO); arrastar mostra o resto. */}
      <ResumoAlerta problema={problema} />
      <Informacoes problema={problema} />
      <Corpo problema={problema} />
    </article>
  )
}
