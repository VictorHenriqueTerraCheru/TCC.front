import type { MaterialSymbol } from 'material-symbols'

import { Icone } from '@/common/components/icone'
import { usePainelResponsivo } from '@/common/hooks/use-painel-responsivo'
import { distanciaTexto, tempoRelativo } from '@/common/lib/formatacao'
import { cn } from '@/common/lib/utils'
import { aparenciaDoGrupo, grupoDe, iconeDe } from '@/features/categorias'

import { mensagemErroVoto } from '../../errors'
import { useDistanciaAte } from '../../hooks/use-distancia-ate'
import { useVotos } from '../../hooks/use-votos'
import type { DetalheProblema } from '../../models/problema'

/** Altura do primeiro estágio da folha no celular: só o card rápido aparece. */
export const ALTURA_RESUMO = 184

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
 * Card rápido do alerta (estilo Waze): primeiro estágio da folha do detalhe. Os polegares votam
 * o que o status pede, com a mesma guarda de conta do detalhe: existência em `nova`,
 * persistência em `ativa` e `possivelmenteResolvida`. O autor não vota existência; `resolvida`
 * é só leitura.
 */
export function ResumoAlerta({ problema }: { problema: DetalheProblema }) {
  const aparencia = aparenciaDoGrupo[grupoDe(problema.categoria)]
  const painel = usePainelResponsivo()
  const distancia = useDistanciaAte(problema)
  const { existencia, persistencia, votarExistencia, votarPersistencia, meus, votando } =
    useVotos(problema)

  let polegares: [Polegar, Polegar] | null = null
  if (problema.status === 'nova' && !problema.souAutor) {
    polegares = [
      {
        rotulo: 'Confirmar que existe',
        icone: 'thumb_up',
        cor: 'var(--voto-sim)',
        marcado: meus.existencia === 'confirma',
        votar: () => votarExistencia('confirma'),
      },
      {
        rotulo: 'Não vi',
        icone: 'thumb_down',
        cor: 'var(--voto-nao)',
        marcado: meus.existencia === 'naoVi',
        votar: () => votarExistencia('naoVi'),
      },
    ]
  } else if (problema.status === 'ativa' || problema.status === 'possivelmenteResolvida') {
    polegares = [
      {
        rotulo: 'Sim, continua',
        icone: 'thumb_up',
        cor: 'var(--voto-sim)',
        marcado: meus.persistencia === 'continua',
        votar: () => votarPersistencia('continua'),
      },
      {
        rotulo: 'Não, foi resolvido',
        icone: 'thumb_down',
        cor: 'var(--voto-nao)',
        marcado: meus.persistencia === 'resolvido',
        votar: () => votarPersistencia('resolvido'),
      },
    ]
  }
  const erro = existencia.error ?? persistencia.error

  return (
    // Tocar no card (fora dos polegares) expande a folha: alternativa de um toque ao arrasto.
    <section
      aria-label="Resumo do alerta"
      className={cn('pr-10', painel.recolhido && 'cursor-pointer')}
      onClick={(evento) => {
        if (!(evento.target as Element).closest('button')) painel.expandir()
      }}
    >
      <div className="flex items-center gap-3">
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
      <div className="mt-3 flex items-end gap-3">
        <div className="min-w-0 flex-1 text-[13px] text-muted-foreground">
          <p className="truncate">
            {problema.endereco} · {tempoRelativo(problema.criadoEm)}
          </p>
          <p>
            {problema.existencia.confirmacoes} confirmaram
            {distancia !== null && ` · ${distanciaTexto(distancia)} de você`}
          </p>
        </div>
        {polegares && (
          <div className="flex shrink-0 gap-2">
            {polegares.map((polegar) => (
              <BotaoPolegar key={polegar.rotulo} polegar={polegar} desabilitado={votando} />
            ))}
          </div>
        )}
      </div>
      {erro && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {mensagemErroVoto(erro)}
        </p>
      )}
    </section>
  )
}
