import { m } from 'motion/react'

import { Icone } from '@/common/components/icone'
import { NumeroAnimado } from '@/common/components/numero-animado'
import { MOLA_SUAVE } from '@/common/lib/movimento'
import { cn } from '@/common/lib/utils'

import type { DetalheProblema, FaixaConfianca } from '../../models/problema'

const rotuloFaixa: Record<FaixaConfianca, string> = {
  alta: 'Confiança alta',
  media: 'Confiança média',
  baixa: 'Confiança baixa',
}

export function BarraConfianca({
  confianca,
  faixa,
  legenda,
}: {
  confianca: number
  faixa: FaixaConfianca
  legenda: string
}) {
  const valor = Math.round(confianca)
  return (
    <section aria-label="Confiança">
      <div className="mb-2 flex items-center gap-2">
        {faixa === 'alta' && (
          <Icone nome="check_circle" preenchido className="text-[20px] text-primario" />
        )}
        <span className={cn('font-medium', faixa === 'alta' && 'text-primario')}>
          {rotuloFaixa[faixa]}
        </span>
        <NumeroAnimado valor={valor} formatar={(n) => `${n} / 100`} className="ml-auto text-sm" />
      </div>
      <div
        role="meter"
        aria-label={rotuloFaixa[faixa]}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={valor}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <m.div
          className="h-full rounded-full bg-primario"
          initial={{ width: 0 }}
          animate={{ width: `${valor}%` }}
          transition={MOLA_SUAVE}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{legenda}</p>
    </section>
  )
}

export function BarraAvaliacao({
  avaliacao,
}: {
  avaliacao: NonNullable<DetalheProblema['avaliacao']>
}) {
  const { votantes, necessarios } = avaliacao
  return (
    <section aria-label="Em avaliação">
      <div className="mb-2 flex items-center gap-2 text-nova">
        <Icone nome="hourglass_top" className="text-[20px]" />
        <span className="font-medium">Em avaliação</span>
        <span className="ml-auto text-sm text-foreground">
          {Math.min(votantes, necessarios)} de {necessarios} votos
        </span>
      </div>
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: necessarios }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-500',
              i < votantes ? 'bg-nova' : 'bg-muted',
            )}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Registro recente, com poucos votos. A confiança aparece depois de {necessarios} votos.
      </p>
    </section>
  )
}
