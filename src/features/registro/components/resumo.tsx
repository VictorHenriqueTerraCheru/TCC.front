import type { MaterialSymbol } from 'material-symbols'
import type { ReactNode } from 'react'

import { Icone } from '@/common/components/icone'

interface LinhaResumoProps {
  icone: ReactNode | MaterialSymbol
  rotulo: string
  valor: ReactNode
  /** Leva de volta ao passo para editar (lápis). */
  aoEditar?(): void
}

export function LinhaResumo({ icone, rotulo, valor, aoEditar }: LinhaResumoProps) {
  return (
    <li className="flex items-center gap-3 border-t border-border/60 px-4 py-3 first:border-t-0">
      <span className="flex w-6 justify-center text-muted-foreground">
        {typeof icone === 'string' ? (
          <Icone nome={icone as MaterialSymbol} className="text-[22px]" />
        ) : (
          icone
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{rotulo}</p>
        <p>{valor}</p>
      </div>
      {aoEditar && (
        <button
          type="button"
          onClick={aoEditar}
          aria-label={`Editar ${rotulo.toLowerCase()}`}
          className="flex size-10 pressionavel items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2"
        >
          <Icone nome="edit" className="text-[20px]" />
        </button>
      )}
    </li>
  )
}

/** Cartão "Resumo" das revisões (telas 8 e 21b). */
export function Resumo({ children }: { children: ReactNode }) {
  return (
    <section aria-labelledby="titulo-resumo">
      <h2 id="titulo-resumo" className="mb-2 font-medium">
        Resumo
      </h2>
      <ul className="rounded-2xl border border-border/60 bg-card shadow-1">{children}</ul>
    </section>
  )
}
