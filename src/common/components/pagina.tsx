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
    <div
      className={cn(
        // Entrada curta a cada rota (sem saída: o mapa não remonta).
        'mx-auto w-full animate-in px-4 pb-6 duration-300 ease-out fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none lg:max-w-3xl lg:px-8',
        className,
      )}
    >
      <header className="flex h-16 items-center justify-between">
        <h1 className="text-[28px] leading-9 font-bold tracking-tight">{titulo}</h1>
        {acoes}
      </header>
      {children}
    </div>
  )
}
