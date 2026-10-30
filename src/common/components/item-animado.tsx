import { m } from 'motion/react'
import type { ComponentProps } from 'react'

import { LIST_DELAY, APPEAR } from '@/common/lib/movimento'

export function AnimatedItem({ index, ...props }: ComponentProps<typeof m.li> & { index: number }) {
  return (
    <m.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...APPEAR, delay: Math.min(index, 8) * LIST_DELAY }}
      {...props}
    />
  )
}
