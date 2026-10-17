import { ChipFiltro } from '@/common/components/chip-filtro'
import { Icone } from '@/common/components/icone'
import { cn } from '@/common/lib/utils'
import { aparenciaDoGrupo, type GrupoCategoria } from '@/features/categorias'

import { gruposDoModo, mostraProblemas, type FiltrosMapa } from '../models/filtros'

interface ChipsFiltroProps extends FiltrosMapa {
  aoAlternarGrupo(grupo: GrupoCategoria): void
  aoAlternarNovas(): void
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
          <ChipFiltro key={grupo} selecionado={selecionado} aoClicar={() => aoAlternarGrupo(grupo)}>
            <Icone
              nome={selecionado ? 'check' : aparencia.icone}
              preenchido
              className={cn('text-[18px]', !selecionado && aparencia.forte)}
            />
            {aparencia.rotulo}
          </ChipFiltro>
        )
      })}
      {mostraProblemas(modo) && (
        <ChipFiltro selecionado={somenteNovas} aoClicar={aoAlternarNovas}>
          <Icone nome={somenteNovas ? 'check' : 'hourglass'} className="text-[18px] text-nova" />
          Em avaliação
        </ChipFiltro>
      )}
    </div>
  )
}
