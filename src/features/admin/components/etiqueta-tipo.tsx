import { cn } from '@/common/lib/utils'
import type { TipoGrupo } from '@/features/categorias'

import { classeDoTipo, rotuloDoTipo } from '../models/tipo'

/** Selo colorido do tipo (Estado azul, Evento roxo) para diferenciar de relance. */
export function EtiquetaTipo({ tipo, className }: { tipo: TipoGrupo; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-semibold',
        classeDoTipo[tipo],
        className,
      )}
    >
      {rotuloDoTipo[tipo]}
    </span>
  )
}
