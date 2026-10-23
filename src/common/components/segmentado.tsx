import { m } from 'motion/react'
import { useId } from 'react'

import { MOLA_SUAVE } from '@/common/lib/movimento'
import { cn } from '@/common/lib/utils'

interface SegmentadoProps<T extends string> {
  rotulo: string
  opcoes: { valor: T; rotulo: string }[]
  valor: T
  aoMudar(valor: T): void
  className?: string
}

/** Controle segmentado de vidro (seletor de modo do mapa, abas do histórico); a pílula desliza. */
export function Segmentado<T extends string>({
  rotulo,
  opcoes,
  valor,
  aoMudar,
  className,
}: SegmentadoProps<T>) {
  // Um layoutId por instância: dois segmentados na mesma tela não trocam pílulas entre si.
  const idPilula = useId()
  return (
    <div
      role="radiogroup"
      aria-label={rotulo}
      className={cn('grid h-10 gap-[3px] rounded-[14px] p-[3px] vidro', className)}
      style={{ gridTemplateColumns: `repeat(${opcoes.length}, minmax(0, 1fr))` }}
    >
      {opcoes.map((opcao) => {
        const selecionado = opcao.valor === valor
        return (
          <button
            key={opcao.valor}
            type="button"
            role="radio"
            aria-checked={selecionado}
            onClick={() => aoMudar(opcao.valor)}
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
            <span className="relative">{opcao.rotulo}</span>
          </button>
        )
      })}
    </div>
  )
}
