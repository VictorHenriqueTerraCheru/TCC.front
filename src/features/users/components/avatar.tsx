import { Icon } from '@/common/components/icon'
import { cn } from '@/common/lib/utils'

import { initials } from '../models/user'

export function Avatar({
  name,
  verified = false,
  size,
}: {
  name: string
  verified?: boolean
  size?: 'md' | 'lg'
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-medium text-brand',
        size === 'lg' ? 'size-16 text-xl' : 'size-10 text-sm',
      )}
    >
      {initials(name)}
      {verified && (
        <span className="absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground">
          <Icon name="check" className="text-[14px] font-bold" />
        </span>
      )}
    </span>
  )
}
