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

/** Destaque por status: o convite muda, a pergunta é a mesma. */
function Convite({ problema }: { problema: DetalheProblema }) {
  const distancia = useDistanciaAte(problema)

  if (problema.status === 'nova') {
    return (
      <div className="mb-1 flex items-start gap-3">
        <Icone nome="near_me" preenchido className="mt-0.5 text-[20px]" />
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

  if (problema.status === 'possivelmenteResolvida') {
    return (
      <>
        <h3 className="mb-2 text-2xl">Ainda está lá?</h3>
        <p className="text-sm">
          {pessoas(problema.votos.naoUltimas24h)} que não está mais lá nas últimas 24 h. Se você
          passou por lá, ajude a confirmar.
        </p>
      </>
    )
  }

  return <h3 className="font-medium">Ainda está lá?</h3>
}

/**
 * A única pergunta do detalhe (telas 3, 22 e 23). A mesma resposta alimenta, na API, a confiança
 * e o ciclo de vida: "Sim" = viu no local; "Não" = foi resolvido ou não encontrou. Nova e
 * Possivelmente resolvida ganham o cartão azul de destaque; Ativa, um cartão neutro.
 */
export function CartaoVoto({ problema }: { problema: DetalheProblema }) {
  const { erro, votar, meuVoto, votando, podeVotar } = useVotos(problema)
  const destaque = problema.status !== 'ativa'
  const { sim, nao } = problema.votos

  return (
    <section
      className={cn(
        'rounded-2xl p-4',
        destaque ? 'bg-primario-suave text-primario' : 'border border-border/60 bg-card',
      )}
    >
      <Convite problema={problema} />
      <p className={cn('mt-2 text-xs', destaque ? 'font-medium' : 'text-muted-foreground')}>
        <NumeroComPulso valor={sim} className={cn('text-2xl', !destaque && 'text-foreground')} />{' '}
        sim{' '}
        <NumeroComPulso
          valor={nao}
          className={cn('ml-2 text-2xl', !destaque && 'text-foreground')}
        />{' '}
        não
      </p>
      {podeVotar ? (
        <div className="mt-3 flex gap-2">
          <BotaoVoto
            className="flex-1"
            variante={destaque ? 'default' : 'tonal'}
            selecionado={meuVoto === 'sim'}
            disabled={votando}
            onClick={() => votar('sim')}
          >
            Sim, está lá
          </BotaoVoto>
          <BotaoVoto
            className={cn('flex-1', destaque && 'border-primario/40 text-primario')}
            variante="outline"
            selecionado={meuVoto === 'nao'}
            disabled={votando}
            onClick={() => votar('nao')}
          >
            Não está lá
          </BotaoVoto>
        </div>
      ) : (
        problema.souAutor && (
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
