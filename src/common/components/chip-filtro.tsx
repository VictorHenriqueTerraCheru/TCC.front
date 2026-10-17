import type { ReactNode } from 'react'

import { cn } from '@/common/lib/utils'

/** Chip de filtro em pílula de vidro (mapa e recentes); marcado em azul. */
export function ChipFiltro({
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
        'flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold shadow-sm transition-colors focus-visible:outline-2',
        selecionado
          ? 'border border-primario bg-primario-suave text-primario backdrop-blur-xl'
          : 'text-foreground vidro hover:bg-superficie-2',
      )}
    >
      {children}
    </button>
  )
}
