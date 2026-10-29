import type { MaterialSymbol } from 'material-symbols'
import type { CSSProperties } from 'react'

import { cn } from '@/common/lib/utils'

interface IconeProps {
  name: MaterialSymbol
  preenchido?: boolean
  className?: string
  style?: CSSProperties
}

export function Icone({ name: nome, preenchido = false, className, style }: IconeProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('material-symbols-rounded shrink-0 select-none', className)}
      style={{ ...style, fontVariationSettings: `'FILL' ${preenchido ? 1 : 0}` }}
    >
      {nome}
    </span>
  )
}
