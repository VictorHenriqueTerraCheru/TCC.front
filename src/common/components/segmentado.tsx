import { cn } from '@/common/lib/utils'

interface SegmentadoProps<T extends string> {
  rotulo: string
  opcoes: { valor: T; rotulo: string }[]
  valor: T
  aoMudar(valor: T): void
  className?: string
}

/** Controle segmentado de vidro (seletor de modo do mapa, abas do histórico). */
export function Segmentado<T extends string>({
  rotulo,
  opcoes,
  valor,
  aoMudar,
  className,
}: SegmentadoProps<T>) {
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
              'flex items-center justify-center rounded-[11px] text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2',
              selecionado
                ? 'bg-primario-suave text-primario'
                : 'text-muted-foreground hover:bg-foreground/5',
            )}
          >
            {opcao.rotulo}
          </button>
        )
      })}
    </div>
  )
}
