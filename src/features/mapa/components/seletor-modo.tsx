import { Icone } from '@/common/components/icone'
import { cn } from '@/common/lib/utils'

import { modosMapa, type ModoMapa } from '../models/filtros'

interface SeletorModoProps {
  modo: ModoMapa
  aoMudar(modo: ModoMapa): void
}

/** Botões segmentados Problemas | Incidentes | Ambos (telas 1, 2). */
export function SeletorModo({ modo, aoMudar }: SeletorModoProps) {
  return (
    <div
      role="radiogroup"
      aria-label="O que mostrar no mapa"
      className="pointer-events-auto grid h-10 grid-cols-3 overflow-hidden rounded-full border border-input bg-background shadow-sm"
    >
      {modosMapa.map(({ valor, rotulo }, i) => {
        const selecionado = valor === modo
        return (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={selecionado}
            onClick={() => aoMudar(valor)}
            className={cn(
              'flex items-center justify-center gap-1.5 text-sm font-medium transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2',
              i > 0 && 'border-l border-input',
              selecionado ? 'bg-secondary text-secondary-foreground' : 'hover:bg-foreground/5',
            )}
          >
            {selecionado && <Icone nome="check" className="text-[18px]" />}
            {rotulo}
          </button>
        )
      })}
    </div>
  )
}
