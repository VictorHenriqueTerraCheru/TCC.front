import { m } from 'motion/react'
import type { ComponentProps } from 'react'

import { ATRASO_LISTA, SURGIR } from '@/common/lib/movimento'

export function ItemAnimado({
  indice,
  ...props
}: ComponentProps<typeof m.li> & { indice: number }) {
  return (
    <m.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SURGIR, delay: Math.min(indice, 8) * ATRASO_LISTA }}
      {...props}
    />
  )
}
