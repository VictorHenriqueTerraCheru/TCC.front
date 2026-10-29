import { Icone } from '@/common/components/icone'
import { NumeroComPulso } from '@/common/components/numero-animado'
import { distanciaTexto } from '@/common/lib/formatacao'
import { cn } from '@/common/lib/utils'

import { mensagemErroVoto } from '../../errors'
import { useDistanciaAte } from '../../hooks/use-distancia-ate'
import { useVotos } from '../../hooks/use-votos'
import type { DetalheProblema } from '../../models/problema'
import { BotaoVoto } from './botao-voto'

const DICA_AUTOR = 'Você registrou este problema'

function pessoas(n: number) {
  return n === 1 ? '1 pessoa disse' : `${n} pessoas disseram`
}

function Convite({ issue: problema }: { issue: DetalheProblema }) {
  const distancia = useDistanciaAte(problema)

  if (problema.status === 'new') {
    return (
      <div className="mb-1 flex items-start gap-3">
        <Icone name="near_me" preenchido className="mt-0.5 text-[20px]" />
        <div>
          <h3 className="font-medium">
            {distancia !== null
              ? `Você está a ${distanciaTexto(distancia)}. Ainda está lá?`
              : 'Ainda está lá?'}
          </h3>
          <p className="text-sm">Quem está perto ajuda mais a avaliar registros novos.</p>
        </div>
      </div>
    )
  }

  if (problema.status === 'possiblyResolved') {
    return (
      <>
        <h3 className="mb-2 text-2xl">Ainda está lá?</h3>
        <p className="text-sm">
          {pessoas(problema.votes.noLast24h)} que não está mais lá nas últimas 24 h. Se você passou
          por lá, ajude a confirmar.
        </p>
      </>
    )
  }

  return <h3 className="font-medium">Ainda está lá?</h3>
}

export function CartaoVoto({ issue: problema }: { issue: DetalheProblema }) {
  const { erro, votar, myVote: meuVoto, votando, podeVotar } = useVotos(problema)
  const destaque = problema.status !== 'active'
  const { yes: sim, no: nao } = problema.votes

  return (
    <section
      className={cn(
        'rounded-2xl p-4',
        destaque ? 'bg-primario-suave text-primario' : 'border border-border/60 bg-card',
      )}
    >
      <Convite issue={problema} />
      <p className={cn('mt-2 text-xs', destaque ? 'font-medium' : 'text-muted-foreground')}>
        <NumeroComPulso value={sim} className={cn('text-2xl', !destaque && 'text-foreground')} />{' '}
        sim{' '}
        <NumeroComPulso
          value={nao}
          className={cn('ml-2 text-2xl', !destaque && 'text-foreground')}
        />{' '}
        não
      </p>
      {podeVotar ? (
        <div className="mt-3 flex gap-2">
          <BotaoVoto
            className="flex-1"
            variante={destaque ? 'default' : 'tonal'}
            selecionado={meuVoto === 'yes'}
            disabled={votando}
            onClick={() => votar('yes')}
          >
            Sim, está lá
          </BotaoVoto>
          <BotaoVoto
            className={cn('flex-1', destaque && 'border-primario/40 text-primario')}
            variante="outline"
            selecionado={meuVoto === 'no'}
            disabled={votando}
            onClick={() => votar('no')}
          >
            Não está lá
          </BotaoVoto>
        </div>
      ) : (
        problema.isAuthor && (
          <p className={cn('mt-2 text-xs', !destaque && 'text-muted-foreground')}>{DICA_AUTOR}</p>
        )
      )}
      {erro && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {mensagemErroVoto(erro)}
        </p>
      )}
    </section>
  )
}
