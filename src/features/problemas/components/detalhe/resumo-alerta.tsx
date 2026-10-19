import type { MaterialSymbol } from 'material-symbols'

import { Icone } from '@/common/components/icone'
import { usePainelResponsivo } from '@/common/hooks/use-painel-responsivo'
import { distanciaTexto } from '@/common/lib/formatacao'
import { cn } from '@/common/lib/utils'
import { aparenciaDoGrupo, grupoDe, iconeDe } from '@/features/categorias'

import { mensagemErroVoto } from '../../errors'
import { useDistanciaAte } from '../../hooks/use-distancia-ate'
import { useVotos } from '../../hooks/use-votos'
import type { DetalheProblema } from '../../models/problema'

/**
 * Altura do primeiro estágio da folha no celular antes da medida: o card registra-se no painel
 * (`medirResumo`) e a folha passa a parar logo abaixo dele.
 */
export const ALTURA_RESUMO = 236

interface Polegar {
  rotulo: string
  icone: MaterialSymbol
  cor: string
  marcado: boolean
  votar(): void
}

function BotaoPolegar({ polegar, desabilitado }: { polegar: Polegar; desabilitado: boolean }) {
  return (
    <button
      type="button"
      aria-label={`Voto rápido: ${polegar.rotulo}`}
      aria-pressed={polegar.marcado}
      disabled={desabilitado}
      onClick={polegar.votar}
      className={cn(
        'flex size-11 items-center justify-center rounded-full bg-foreground/8 transition-colors hover:bg-foreground/12 focus-visible:outline-2 disabled:opacity-40',
        polegar.marcado && 'ring-2 ring-current',
      )}
      style={{ color: polegar.cor }}
    >
      <Icone nome={polegar.icone} preenchido={polegar.marcado} className="text-[21px]" />
    </button>
  )
}

/**
 * Card rápido do alerta (estilo Waze): primeiro estágio da folha do detalhe. Recolhida, tem
 * "Ainda está lá?" com os polegares, com a mesma guarda de conta do detalhe. O autor não vota;
 * `resolvida` é só leitura.
 */
export function ResumoAlerta({ problema }: { problema: DetalheProblema }) {
  const aparencia = aparenciaDoGrupo[grupoDe(problema.categoria)]
  const { recolhido, expandir, medirResumo } = usePainelResponsivo()
  const distancia = useDistanciaAte(problema)
  const { erro, votar, meuVoto, votando, podeVotar } = useVotos(problema)

  const polegares: [Polegar, Polegar] = [
    {
      rotulo: 'Sim, está lá',
      icone: 'thumb_up',
      cor: 'var(--voto-sim)',
      marcado: meuVoto === 'sim',
      votar: () => votar('sim'),
    },
    {
      rotulo: 'Não está lá',
      icone: 'thumb_down',
      cor: 'var(--voto-nao)',
      marcado: meuVoto === 'nao',
      votar: () => votar('nao'),
    },
  ]

  return (
    // Tocar no card (fora dos polegares) expande a folha: alternativa de um toque ao arrasto.
    <section
      ref={medirResumo}
      aria-label="Resumo do alerta"
      className={cn(recolhido && 'cursor-pointer')}
      onClick={(evento) => {
        if (!(evento.target as Element).closest('button')) expandir()
      }}
    >
      <div className="flex items-center gap-3 pr-10">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: aparencia.corForte }}
        >
          <Icone nome={iconeDe(problema.categoria)} preenchido className="text-[26px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn('text-xs font-semibold', aparencia.forte)}>{aparencia.rotulo}</p>
          <h2 className="truncate text-[20px] leading-7 font-semibold">
            {problema.categoria.nome}
          </h2>
        </div>
      </div>
      <div className="mt-3 space-y-1 text-[13px] text-muted-foreground">
        <p className="flex items-start gap-1.5">
          <Icone nome="location_on" className="mt-px text-[16px]" />
          <span className="line-clamp-2">{problema.endereco}</span>
        </p>
        <p className="flex items-center gap-1.5">
          <Icone nome="group" className="text-[16px]" />
          {problema.votos.sim} confirmaram
          {distancia !== null && ` · ${distanciaTexto(distancia)} de você`}
        </p>
      </div>
      {/* Só na folha recolhida: aberta (ou no desktop), o cartão completo do detalhe já pergunta,
          e duas perguntas iguais na mesma tela confundem. */}
      {podeVotar && recolhido && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-foreground/5 py-2 pr-2 pl-4">
          <p className="min-w-0 flex-1 text-[15px] font-semibold">Ainda está lá?</p>
          {polegares.map((polegar) => (
            <BotaoPolegar key={polegar.rotulo} polegar={polegar} desabilitado={votando} />
          ))}
        </div>
      )}
      {erro && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {mensagemErroVoto(erro)}
        </p>
      )}
    </section>
  )
}
