import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'

import { Icone } from '@/common/components/icone'

interface TelaComVoltarProps {
  titulo: string
  aoVoltar?(): void
  children: ReactNode
}

export function TelaComVoltar({ titulo, aoVoltar, children }: TelaComVoltarProps) {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-full animate-in flex-col duration-300 ease-out fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none">
      <header className="flex h-16 shrink-0 items-center gap-2 px-1">
        <button
          type="button"
          onClick={aoVoltar ?? (() => navigate(-1))}
          aria-label="Voltar"
          className="flex size-12 pressionavel items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2"
        >
          <Icone name="arrow_back" />
        </button>
        <h1 className="text-[20px] leading-7 font-semibold tracking-tight">{titulo}</h1>
      </header>
      <div className="flex flex-1 flex-col px-4 pb-6">{children}</div>
    </div>
  )
}
