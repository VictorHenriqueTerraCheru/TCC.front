import { ChipFiltro } from '@/common/components/chip-filtro'
import { Icone } from '@/common/components/icone'
import { aparenciaDaCor, PontoGrupo, useAparencia } from '@/features/categorias'

import { gruposDoModo, mostraProblemas, type FiltrosMapa } from '../models/filtros'

interface ChipsFiltroProps extends FiltrosMapa {
  aoAlternarGrupo(grupo: string): void
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
  const { grupos: todos } = useAparencia()
  return (
    <div
      role="group"
      aria-label="Filtros"
      className="pointer-events-auto -mx-3 flex [scrollbar-width:none] gap-2 overflow-x-auto px-3 pb-1"
    >
      {gruposDoModo(todos, modo).map((grupo) => {
        const selecionado = grupos.includes(grupo.chave)
        return (
          <ChipFiltro
            key={grupo.chave}
            selecionado={selecionado}
            aoClicar={() => aoAlternarGrupo(grupo.chave)}
          >
            {selecionado ? (
              <Icone nome="check" preenchido className="text-[18px]" />
            ) : (
              <PontoGrupo cor={aparenciaDaCor[grupo.cor]} />
            )}
            {grupo.rotulo}
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
