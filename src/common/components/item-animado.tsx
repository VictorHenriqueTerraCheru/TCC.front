import { m } from 'motion/react'
import type { ComponentProps } from 'react'

import { ATRASO_LISTA, SURGIR } from '@/common/lib/movimento'

/** Item de lista que sobe e aparece em sequência na primeira carga (o atraso para no 8º item). */
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
