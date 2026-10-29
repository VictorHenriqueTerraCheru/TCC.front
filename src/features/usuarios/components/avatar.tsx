import { Icone } from '@/common/components/icone'
import { cn } from '@/common/lib/utils'

import { iniciais } from '../models/usuario'

export function Avatar({
  nome,
  verificado = false,
  tamanho = 'md',
}: {
  nome: string
  verificado?: boolean
  tamanho?: 'md' | 'lg'
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full bg-primario-suave font-medium text-primario',
        tamanho === 'lg' ? 'size-16 text-xl' : 'size-10 text-sm',
      )}
    >
      {iniciais(nome)}
      {verificado && (
        <span className="absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground">
          <Icone nome="check" className="text-[14px] font-bold" />
        </span>
      )}
    </span>
  )
}
