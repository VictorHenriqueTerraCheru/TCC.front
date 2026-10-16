import { Icone } from '@/common/components/icone'
import { cn } from '@/common/lib/utils'

interface SegmentadoProps<T extends string> {
  rotulo: string
  opcoes: { valor: T; rotulo: string }[]
  valor: T
  aoMudar(valor: T): void
  className?: string
}

/** Botões segmentados do Material 3 (seletor de modo do mapa, abas do histórico). */
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
      className={cn(
        'grid h-10 overflow-hidden rounded-full border border-input bg-background',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${opcoes.length}, minmax(0, 1fr))` }}
    >
      {opcoes.map((opcao, i) => {
        const selecionado = opcao.valor === valor
        return (
          <button
            key={opcao.valor}
            type="button"
            role="radio"
            aria-checked={selecionado}
            onClick={() => aoMudar(opcao.valor)}
            className={cn(
              'flex items-center justify-center gap-1.5 text-sm font-medium transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2',
              i > 0 && 'border-l border-input',
              selecionado ? 'bg-secondary text-secondary-foreground' : 'hover:bg-foreground/5',
            )}
          >
            {selecionado && <Icone nome="check" className="text-[18px]" />}
            {opcao.rotulo}
          </button>
        )
      })}
    </div>
  )
}
