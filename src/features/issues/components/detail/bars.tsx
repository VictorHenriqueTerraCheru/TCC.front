import { m } from 'motion/react'

import { Icon } from '@/common/components/icon'
import { AnimatedNumber } from '@/common/components/animated-number'
import { SOFT_SPRING } from '@/common/lib/motion'
import { cn } from '@/common/lib/utils'

import type { IssueDetail, TrustBand } from '../../models/issue'

const bandLabel: Record<TrustBand, string> = {
  high: 'Confiança alta',
  medium: 'Confiança média',
  low: 'Confiança baixa',
}

export function TrustBar({
  trustScore: trust,
  band,
  legend,
}: {
  trustScore: number
  band: TrustBand
  legend: string
}) {
  const value = Math.round(trust)
  return (
    <section aria-label="Confiança">
      <div className="mb-2 flex items-center gap-2">
        {band === 'high' && (
          <Icon name="check_circle" filled className="text-[20px] text-primario" />
        )}
        <span className={cn('font-medium', band === 'high' && 'text-primario')}>
          {bandLabel[band]}
        </span>
        <AnimatedNumber value={value} format={(n) => `${n} / 100`} className="ml-auto text-sm" />
      </div>
      <div
        role="meter"
        aria-label={bandLabel[band]}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <m.div
          className="h-full rounded-full bg-primario"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={SOFT_SPRING}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{legend}</p>
    </section>
  )
}

export function EvaluationBar({
  evaluation,
}: {
  evaluation: NonNullable<IssueDetail['evaluation']>
}) {
  const { voters, required } = evaluation
  return (
    <section aria-label="Em avaliação">
      <div className="mb-2 flex items-center gap-2 text-nova">
        <Icon name="hourglass_top" className="text-[20px]" />
        <span className="font-medium">Em avaliação</span>
        <span className="ml-auto text-sm text-foreground">
          {Math.min(voters, required)} de {required} votos
        </span>
      </div>
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: required }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-500',
              i < voters ? 'bg-nova' : 'bg-muted',
            )}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Registro recente, com poucos votos. A confiança aparece depois de {required} votos.
      </p>
    </section>
  )
}
