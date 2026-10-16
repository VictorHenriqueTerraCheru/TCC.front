import type { ComponentProps } from 'react'

import { Icone } from '@/common/components/icone'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'

interface BotaoVotoProps extends Omit<ComponentProps<typeof Button>, 'variant'> {
  /** Voto atual do usuário (meusVotos): fica cheio e com check. */
  selecionado: boolean
  variante: 'tonal' | 'outline' | 'default'
}

export function BotaoVoto({
  selecionado,
  variante,
  className,
  children,
  ...props
}: BotaoVotoProps) {
  return (
    <Button
      variant={selecionado ? 'default' : variante}
      aria-pressed={selecionado}
      className={cn('h-auto min-h-10 py-2 whitespace-normal', className)}
      {...props}
    >
      {selecionado && <Icone nome="check" className="text-[18px]" />}
      {children}
    </Button>
  )
}
