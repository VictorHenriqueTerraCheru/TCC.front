import type { MaterialSymbol } from 'material-symbols'
import { m } from 'motion/react'

import { Icone } from '@/common/components/icone'
import { IconeDinamico } from '@/common/components/icone-remoto'
import { usePainelResponsivo } from '@/common/hooks/use-painel-responsivo'
import { distanciaTexto } from '@/common/lib/formatacao'
import { MOLA_RAPIDA } from '@/common/lib/movimento'
import { cn } from '@/common/lib/utils'
import { iconeDe, useAparencia } from '@/features/categorias'

import { mensagemErroVoto } from '../../errors'
import { useDistanciaAte } from '../../hooks/use-distancia-ate'
import { useVotos } from '../../hooks/use-votos'
import type { DetalheProblema } from '../../models/problema'

export const ALTURA_RESUMO = 236

interface Polegar {
  label: string
  icon: MaterialSymbol
  color: string
  marcado: boolean
  votar(): void
}

function BotaoPolegar({ polegar, desabilitado }: { polegar: Polegar; desabilitado: boolean }) {
  return (
    <button
      type="button"
      aria-label={`Voto rápido: ${polegar.label}`}
      aria-pressed={polegar.marcado}
      disabled={desabilitado}
      onClick={polegar.votar}
      className={cn(
        'flex size-11 pressionavel items-center justify-center rounded-full bg-foreground/8 hover:bg-foreground/12 focus-visible:outline-2 disabled:opacity-40',
        polegar.marcado && 'ring-2 ring-current',
      )}
      style={{ color: polegar.color }}
    >
      <m.span
        initial={false}
        animate={polegar.marcado ? { scale: [1, 1.3, 1], rotate: [0, -12, 0] } : { scale: 1 }}
        transition={polegar.marcado ? { duration: 0.4, ease: 'easeOut' } : MOLA_RAPIDA}
        className="flex"
      >
        <Icone name={polegar.icon} preenchido={polegar.marcado} className="text-[21px]" />
      </m.span>
    </button>
  )
}

export function ResumoAlerta({ issue: problema }: { issue: DetalheProblema }) {
  const { aparenciaDe } = useAparencia()
  const aparencia = aparenciaDe(problema.category)
  const { recolhido, expandir, medirResumo } = usePainelResponsivo()
  const distancia = useDistanciaAte(problema)
  const { erro, votar, myVote: meuVoto, votando, podeVotar } = useVotos(problema)

  const polegares: [Polegar, Polegar] = [
    {
      label: 'Sim, está lá',
      icon: 'thumb_up',
      color: 'var(--voto-sim)',
      marcado: meuVoto === 'yes',
      votar: () => votar('yes'),
    },
    {
      label: 'Não está lá',
      icon: 'thumb_down',
      color: 'var(--voto-nao)',
      marcado: meuVoto === 'no',
      votar: () => votar('no'),
    },
  ]

  return (
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
          <IconeDinamico name={iconeDe(problema.category)} preenchido className="text-[26px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn('text-xs font-semibold', aparencia.forte)}>{aparencia.label}</p>
          <h2 className="truncate text-[20px] leading-7 font-semibold">{problema.category.name}</h2>
        </div>
      </div>
      <div className="mt-3 space-y-1 text-[13px] text-muted-foreground">
        <p className="flex items-start gap-1.5">
          <Icone name="location_on" className="mt-px text-[16px]" />
          <span className="line-clamp-2">{problema.address}</span>
        </p>
        <p className="flex items-center gap-1.5">
          <Icone name="group" className="text-[16px]" />
          {problema.votes.yes} confirmaram
          {distancia !== null && ` · ${distanciaTexto(distancia)} de você`}
        </p>
      </div>

      {podeVotar && recolhido && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-foreground/5 py-2 pr-2 pl-4">
          <p className="min-w-0 flex-1 text-[15px] font-semibold">Ainda está lá?</p>
          {polegares.map((polegar) => (
            <BotaoPolegar key={polegar.label} polegar={polegar} desabilitado={votando} />
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
