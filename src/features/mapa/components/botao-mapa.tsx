import type { ComponentProps } from 'react'

import { cn } from '@/common/lib/utils'

/** Botão quadrado arredondado sobre o mapa (GPS, legenda). */
export function BotaoMapa({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'pointer-events-auto flex size-11 items-center justify-center rounded-xl bg-surface-container-high text-foreground shadow-md transition-colors hover:bg-surface-container focus-visible:outline-2',
        className,
      )}
      {...props}
    />
  )
}
