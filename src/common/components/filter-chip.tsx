import type { ReactNode } from 'react'

import { cn } from '@/common/lib/utils'

export function FilterChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick(): void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'flex h-8 shrink-0 pressionavel items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold shadow-1 focus-visible:outline-2',
        selected
          ? 'border border-primario/60 bg-primario-suave text-primario backdrop-blur-xl'
          : 'text-foreground vidro hover:bg-superficie-2',
      )}
    >
      {children}
    </button>
  )
}
