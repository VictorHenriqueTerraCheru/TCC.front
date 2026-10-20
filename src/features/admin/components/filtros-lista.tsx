import type { ReactNode } from 'react'

import { Segmentado } from '@/common/components/segmentado'
import { Button } from '@/common/ui/button'
import type { TipoGrupo } from '@/features/categorias'

import { rotuloDoTipo } from '../models/tipo'

export type FiltroTipo = 'todos' | TipoGrupo

const opcoesTipo: { valor: FiltroTipo; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'problema', rotulo: rotuloDoTipo.problema },
  { valor: 'incidente', rotulo: rotuloDoTipo.incidente },
]

export function SegmentadoTipo({
  valor,
  aoMudar,
}: {
  valor: FiltroTipo
  aoMudar(valor: FiltroTipo): void
}) {
  return (
    <Segmentado<FiltroTipo> rotulo="Tipo" opcoes={opcoesTipo} valor={valor} aoMudar={aoMudar} />
  )
}

/** "12 de 30 categorias" + Limpar filtros (só aparece com algum filtro ligado). */
export function ResumoDosFiltros({
  mostradas,
  total,
  substantivo,
  filtrando,
  aoLimpar,
}: {
  mostradas: number
  total: number
  /** Plural: "categorias", "grupos". */
  substantivo: string
  filtrando: boolean
  aoLimpar(): void
}): ReactNode {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {filtrando ? `${mostradas} de ${total} ${substantivo}` : `${total} ${substantivo}`}
      </p>
      {filtrando && (
        <Button variant="ghost" size="sm" onClick={aoLimpar}>
          Limpar filtros
        </Button>
      )}
    </div>
  )
}
