import type { ComponentProps } from 'react'

import { cn } from '@/common/lib/utils'

/** Botão do grupo de vidro sobre o mapa (legenda, GPS); o grupo dá o fundo e o raio. */
export function BotaoMapa({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'flex size-11 items-center justify-center text-primario transition-colors hover:bg-foreground/5 focus-visible:outline-2 focus-visible:-outline-offset-2',
        className,
      )}
      {...props}
    />
  )
}
