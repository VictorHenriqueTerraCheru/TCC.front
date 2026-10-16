import type { ReactNode } from 'react'

import { Icone } from '@/common/components/icone'
import { cn } from '@/common/lib/utils'
import { aparenciaDoGrupo, type GrupoCategoria } from '@/features/categorias'

import { gruposDoModo, mostraProblemas, type FiltrosMapa } from '../models/filtros'

interface ChipsFiltroProps extends FiltrosMapa {
  aoAlternarGrupo(grupo: GrupoCategoria): void
  aoAlternarNovas(): void
}

function Chip({
  selecionado,
  aoClicar,
  children,
}: {
  selecionado: boolean
  aoClicar(): void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selecionado}
      onClick={aoClicar}
      className={cn(
        'flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium shadow-sm transition-colors focus-visible:outline-2',
        selecionado
          ? 'border-transparent bg-secondary text-secondary-foreground'
          : 'border-input bg-background hover:bg-surface-container',
      )}
    >
      {children}
    </button>
  )
}

/** Chips de filtro por grupo + "Em avaliação"; mudam conforme o modo. */
export function ChipsFiltro({
  modo,
  grupos,
  somenteNovas,
  aoAlternarGrupo,
  aoAlternarNovas,
}: ChipsFiltroProps) {
  return (
    <div
      role="group"
      aria-label="Filtros"
      className="pointer-events-auto -mx-3 flex [scrollbar-width:none] gap-2 overflow-x-auto px-3 pb-1"
    >
      {gruposDoModo(modo).map((grupo) => {
        const aparencia = aparenciaDoGrupo[grupo]
        const selecionado = grupos.includes(grupo)
        return (
          <Chip key={grupo} selecionado={selecionado} aoClicar={() => aoAlternarGrupo(grupo)}>
            <Icone
              nome={selecionado ? 'check' : aparencia.icone}
              preenchido
              className={cn('text-[18px]', !selecionado && aparencia.forte)}
            />
            {aparencia.rotulo}
          </Chip>
        )
      })}
      {mostraProblemas(modo) && (
        <Chip selecionado={somenteNovas} aoClicar={aoAlternarNovas}>
          <Icone nome={somenteNovas ? 'check' : 'hourglass'} className="text-[18px] text-nova" />
          Em avaliação
        </Chip>
      )}
    </div>
  )
}
