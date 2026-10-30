import type { MaterialSymbol } from 'material-symbols'
import type { CSSProperties } from 'react'

import { cn } from '@/common/lib/utils'

interface IconProps {
  name: MaterialSymbol
  filled?: boolean
  className?: string
  style?: CSSProperties
}

export function Icon({ name, filled = false, className, style }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('material-symbols-rounded shrink-0 select-none', className)}
      style={{ ...style, fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
      {name}
    </span>
  )
}
