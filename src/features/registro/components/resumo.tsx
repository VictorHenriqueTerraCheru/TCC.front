import type { MaterialSymbol } from 'material-symbols'
import type { ReactNode } from 'react'

import { Icone } from '@/common/components/icone'

interface LinhaResumoProps {
  icon: ReactNode | MaterialSymbol
  label: string
  value: ReactNode
  aoEditar?(): void
}

export function LinhaResumo({
  icon: icone,
  label: rotulo,
  value: valor,
  aoEditar,
}: LinhaResumoProps) {
  return (
    <li className="flex items-center gap-3 border-t border-border/60 px-4 py-3 first:border-t-0">
      <span className="flex w-6 justify-center text-muted-foreground">
        {typeof icone === 'string' ? (
          <Icone name={icone as MaterialSymbol} className="text-[22px]" />
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
          <Icone name="edit" className="text-[20px]" />
        </button>
      )}
    </li>
  )
}

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
