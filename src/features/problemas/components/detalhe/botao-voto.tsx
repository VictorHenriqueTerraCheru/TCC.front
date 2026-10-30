import type { ComponentProps } from 'react'

import { Icon } from '@/common/components/icone'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'

interface VoteButtonProps extends Omit<ComponentProps<typeof Button>, 'variant'> {
  selected: boolean
  variant: 'tonal' | 'outline' | 'default'
}

export function VoteButton({ selected, variant, className, children, ...props }: VoteButtonProps) {
  return (
    <Button
      variant={selected ? 'default' : variant}
      aria-pressed={selected}
      className={cn('h-auto min-h-10 py-2 whitespace-normal', className)}
      {...props}
    >
      {selected && <Icon name="check" className="text-[18px]" />}
      {children}
    </Button>
  )
}
