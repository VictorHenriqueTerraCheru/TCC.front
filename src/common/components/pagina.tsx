import type { ReactNode } from 'react'

import { cn } from '@/common/lib/utils'

interface PaginaProps {
  titulo: string
  acoes?: ReactNode
  children: ReactNode
  className?: string
}

/** Página sem mapa (Recentes, Perfil…): cabeçalho do protótipo; no desktop, centralizada em max-w-3xl. */
export function Pagina({ titulo, acoes, children, className }: PaginaProps) {
  return (
    <div className={cn('mx-auto w-full px-4 pb-6 lg:max-w-3xl lg:px-8', className)}>
      <header className="flex h-16 items-center justify-between">
        <h1 className="text-[22px] leading-7">{titulo}</h1>
        {acoes}
      </header>
      {children}
    </div>
  )
}
