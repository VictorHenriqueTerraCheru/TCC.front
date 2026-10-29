import { ChipFiltro } from '@/common/components/chip-filtro'
import { Icone } from '@/common/components/icone'
import { aparenciaDaCor, PontoGrupo, useAparencia } from '@/features/categorias'

import { gruposDoModo, mostraProblemas, type FiltrosMapa } from '../models/filtros'

interface ChipsFiltroProps extends FiltrosMapa {
  aoAlternarGrupo(grupo: string): void
  aoAlternarNovas(): void
}

export function ChipsFiltro({
  modo,
  grupos,
  somenteNovas,
  aoAlternarGrupo,
  aoAlternarNovas,
}: ChipsFiltroProps) {
  const { grupos: todos } = useAparencia()
  return (
    <div
      role="group"
      aria-label="Filtros"
      className="pointer-events-auto -mx-3 flex [scrollbar-width:none] gap-2 overflow-x-auto px-3 pb-1"
    >
      {gruposDoModo(todos, modo).map((grupo) => {
        const selecionado = grupos.includes(grupo.key)
        return (
          <ChipFiltro
            key={grupo.key}
            selecionado={selecionado}
            aoClicar={() => aoAlternarGrupo(grupo.key)}
          >
            {selecionado ? (
              <Icone name="check" preenchido className="text-[18px]" />
            ) : (
              <PontoGrupo color={aparenciaDaCor[grupo.color]} />
            )}
            {grupo.label}
          </ChipFiltro>
        )
      })}
      {mostraProblemas(modo) && (
        <ChipFiltro selecionado={somenteNovas} aoClicar={aoAlternarNovas}>
          <Icone name={somenteNovas ? 'check' : 'hourglass'} className="text-[18px] text-nova" />
          Em avaliação
        </ChipFiltro>
      )}
    </div>
  )
}
