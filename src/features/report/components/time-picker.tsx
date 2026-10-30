import { AnimatePresence, m } from 'motion/react'
import { useId } from 'react'

import { Icon } from '@/common/components/icon'
import { SOFT_SPRING, APPEAR } from '@/common/lib/motion'
import { cn } from '@/common/lib/utils'

import {
  describeTimeShort,
  initialOtherTime,
  timeStep,
  type OccurrenceTime,
  type TimeMode,
} from '../models/time'

const options: { mode: TimeMode; label: string }[] = [
  { mode: 'now', label: 'Agora' },
  { mode: 'oneHour', label: 'Há 1 hora' },
  { mode: 'other', label: 'Outro horário' },
]

interface TimePickerProps {
  time: OccurrenceTime
  onChange(time: OccurrenceTime): void
}

export function TimePicker({ time, onChange }: TimePickerProps) {
  const now = new Date()
  const chosen = time.otherAt ? new Date(time.otherAt) : initialOtherTime(now)
  const previous = timeStep(chosen, -1, now)
  const next = timeStep(chosen, 1, now)

  const pillId = useId()
  return (
    <section aria-labelledby="when-title">
      <h2 id="when-title" className="mb-2 text-sm font-medium">
        Quando aconteceu?
      </h2>
      <div role="radiogroup" aria-labelledby="when-title" className="flex flex-wrap gap-2">
        {options.map(({ mode, label }) => {
          const selected = time.mode === mode
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() =>
                onChange({
                  mode,
                  otherAt: mode === 'other' ? chosen.toISOString() : null,
                })
              }
              className={cn(
                'relative flex h-11 pressionavel items-center gap-1.5 rounded-full border px-4 text-sm font-medium focus-visible:outline-2',
                selected
                  ? 'border-transparent text-primario'
                  : 'border-input hover:bg-foreground/5',
              )}
            >
              {selected && (
                <m.span
                  layoutId={pillId}
                  transition={SOFT_SPRING}
                  className="absolute inset-0 rounded-full bg-primario-suave"
                />
              )}
              <AnimatePresence initial={false}>
                {selected && (
                  <m.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={APPEAR}
                    className="relative flex overflow-hidden"
                  >
                    <Icon name="check" className="text-[18px]" />
                  </m.span>
                )}
              </AnimatePresence>
              <span className="relative">{label}</span>
            </button>
          )
        })}
      </div>

      {time.mode === 'other' && (
        <m.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={APPEAR}
          className="mt-4"
        >
          <div className="relative flex h-14 items-center rounded-2xl border border-ring bg-card pr-2 pl-4 shadow-[0_0_0_4px_color-mix(in_srgb,var(--ring)_14%,transparent)]">
            <span className="absolute top-2 left-4 text-[11px] font-medium text-primario">
              Hora aproximada
            </span>
            <output aria-live="polite" className="flex-1 pt-4 tabular-nums">
              {describeTimeShort(chosen)}
            </output>
            <button
              type="button"
              aria-label="15 minutos antes"
              disabled={!previous}
              onClick={() =>
                previous && onChange({ mode: 'other', otherAt: previous.toISOString() })
              }
              className="flex size-10 pressionavel items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2 disabled:opacity-30"
            >
              <Icon name="remove" />
            </button>
            <button
              type="button"
              aria-label="15 minutos depois"
              disabled={!next}
              onClick={() => next && onChange({ mode: 'other', otherAt: next.toISOString() })}
              className="flex size-10 pressionavel items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2 disabled:opacity-30"
            >
              <Icon name="add" />
            </button>
          </div>
          <p className="mt-1 px-4 text-xs text-muted-foreground">
            Registros de incidentes aceitam até 24 h
          </p>
        </m.div>
      )}
    </section>
  )
}
