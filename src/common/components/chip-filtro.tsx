import type { ReactNode } from 'react'

import { cn } from '@/common/lib/utils'

/** Chip de filtro do Material 3 (mapa e recentes). */
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
