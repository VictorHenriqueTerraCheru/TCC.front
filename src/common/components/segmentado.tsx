import { m } from 'motion/react'
import { useId } from 'react'

import { MOLA_SUAVE } from '@/common/lib/movimento'
import { cn } from '@/common/lib/utils'

interface SegmentadoProps<T extends string> {
  label: string
  opcoes: { value: T; label: string }[]
  value: T
  aoMudar(valor: T): void
  className?: string
}

export function Segmentado<T extends string>({
  label: rotulo,
  opcoes,
  value: valor,
  aoMudar,
  className,
}: SegmentadoProps<T>) {
  const idPilula = useId()
  return (
    <div
      role="radiogroup"
      aria-label={rotulo}
      className={cn('grid h-10 gap-[3px] rounded-[14px] p-[3px] vidro', className)}
      style={{ gridTemplateColumns: `repeat(${opcoes.length}, minmax(0, 1fr))` }}
    >
      {opcoes.map((opcao) => {
        const selecionado = opcao.value === valor
        return (
          <button
            key={opcao.value}
            type="button"
            role="radio"
            aria-checked={selecionado}
            onClick={() => aoMudar(opcao.value)}
            className={cn(
              'relative flex pressionavel items-center justify-center rounded-[11px] text-[13px] font-semibold focus-visible:outline-2 focus-visible:-outline-offset-2',
              selecionado ? 'text-primario' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {selecionado && (
              <m.span
                layoutId={idPilula}
                transition={MOLA_SUAVE}
                className="absolute inset-0 rounded-[11px] bg-primario-suave shadow-1 ring-1 ring-primario/15"
              />
            )}
            <span className="relative">{opcao.label}</span>
          </button>
        )
      })}
    </div>
  )
}
