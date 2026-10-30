import { cn } from '@/common/lib/utils'
import type { GroupType } from '@/features/categories'

import { typeClass, typeLabel } from '../models/type'

export function TypeLabel({ type, className }: { type: GroupType; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-semibold',
        typeClass[type],
        className,
      )}
    >
      {typeLabel[type]}
    </span>
  )
}
