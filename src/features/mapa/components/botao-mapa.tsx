import type { ComponentProps } from 'react'

import { cn } from '@/common/lib/utils'

export function MapButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'flex size-11 pressionavel items-center justify-center text-primario transition-colors hover:bg-foreground/5 focus-visible:outline-2 focus-visible:-outline-offset-2',
        className,
      )}
      {...props}
    />
  )
}
