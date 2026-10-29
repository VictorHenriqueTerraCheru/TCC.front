import type { ReactNode } from 'react'

import { Segmentado } from '@/common/components/segmentado'
import { Button } from '@/common/ui/button'
import type { TipoGrupo } from '@/features/categorias'

import { rotuloDoTipo } from '../models/tipo'

export type FiltroTipo = 'todos' | TipoGrupo

const opcoesTipo: { value: FiltroTipo; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'issue', label: rotuloDoTipo.issue },
  { value: 'incident', label: rotuloDoTipo.incident },
]

export function SegmentadoTipo({
  value: valor,
  aoMudar,
}: {
  value: FiltroTipo
  aoMudar(valor: FiltroTipo): void
}) {
  return <Segmentado<FiltroTipo> label="Tipo" opcoes={opcoesTipo} value={valor} aoMudar={aoMudar} />
}

export function ResumoDosFiltros({
  mostradas,
  total,
  substantivo,
  filtrando,
  aoLimpar,
}: {
  mostradas: number
  total: number
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
