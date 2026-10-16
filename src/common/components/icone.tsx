import type { MaterialSymbol } from 'material-symbols'

import { cn } from '@/common/lib/utils'

interface IconeProps {
  nome: MaterialSymbol
  /** Preenchido (FILL 1), como os ícones selecionados do protótipo. */
  preenchido?: boolean
  className?: string
}

/** Ícone Material Symbols Rounded. Decorativo: quem precisa de rótulo é o botão em volta. */
export function Icone({ nome, preenchido = false, className }: IconeProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('material-symbols-rounded shrink-0 select-none', className)}
      style={{ fontVariationSettings: `'FILL' ${preenchido ? 1 : 0}` }}
    >
      {nome}
    </span>
  )
}
