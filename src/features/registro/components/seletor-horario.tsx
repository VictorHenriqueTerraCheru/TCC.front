import { AnimatePresence, m } from 'motion/react'
import { useId } from 'react'

import { Icone } from '@/common/components/icone'
import { MOLA_SUAVE, SURGIR } from '@/common/lib/movimento'
import { cn } from '@/common/lib/utils'

import {
  descreverHorarioCurto,
  horarioInicialOutro,
  passoHorario,
  type Horario,
  type ModoHorario,
} from '../models/horario'

const opcoes: { modo: ModoHorario; rotulo: string }[] = [
  { modo: 'agora', rotulo: 'Agora' },
  { modo: 'umaHora', rotulo: 'Há 1 hora' },
  { modo: 'outro', rotulo: 'Outro horário' },
]

interface SeletorHorarioProps {
  horario: Horario
  aoMudar(horario: Horario): void
}

export function SeletorHorario({ horario, aoMudar }: SeletorHorarioProps) {
  const agora = new Date()
  const escolhido = horario.outroEm ? new Date(horario.outroEm) : horarioInicialOutro(agora)
  const anterior = passoHorario(escolhido, -1, agora)
  const proximo = passoHorario(escolhido, 1, agora)

  const idPilula = useId()
  return (
    <section aria-labelledby="titulo-quando">
      <h2 id="titulo-quando" className="mb-2 text-sm font-medium">
        Quando aconteceu?
      </h2>
      <div role="radiogroup" aria-labelledby="titulo-quando" className="flex flex-wrap gap-2">
        {opcoes.map(({ modo, rotulo }) => {
          const selecionado = horario.modo === modo
          return (
            <button
              key={modo}
              type="button"
              role="radio"
              aria-checked={selecionado}
              onClick={() =>
                aoMudar({
                  modo,
                  outroEm: modo === 'outro' ? escolhido.toISOString() : null,
                })
              }
              className={cn(
                'relative flex h-11 pressionavel items-center gap-1.5 rounded-full border px-4 text-sm font-medium focus-visible:outline-2',
                selecionado
                  ? 'border-transparent text-primario'
                  : 'border-input hover:bg-foreground/5',
              )}
            >
              {selecionado && (
                <m.span
                  layoutId={idPilula}
                  transition={MOLA_SUAVE}
                  className="absolute inset-0 rounded-full bg-primario-suave"
                />
              )}
              <AnimatePresence initial={false}>
                {selecionado && (
                  <m.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={SURGIR}
                    className="relative flex overflow-hidden"
                  >
                    <Icone nome="check" className="text-[18px]" />
                  </m.span>
                )}
              </AnimatePresence>
              <span className="relative">{rotulo}</span>
            </button>
          )
        })}
      </div>

      {horario.modo === 'outro' && (
        <m.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SURGIR}
          className="mt-4"
        >
          <div className="relative flex h-14 items-center rounded-2xl border border-ring bg-card pr-2 pl-4 shadow-[0_0_0_4px_color-mix(in_srgb,var(--ring)_14%,transparent)]">
            <span className="absolute top-2 left-4 text-[11px] font-medium text-primario">
              Hora aproximada
            </span>
            <output aria-live="polite" className="flex-1 pt-4 tabular-nums">
              {descreverHorarioCurto(escolhido)}
            </output>
            <button
              type="button"
              aria-label="15 minutos antes"
              disabled={!anterior}
              onClick={() =>
                anterior && aoMudar({ modo: 'outro', outroEm: anterior.toISOString() })
              }
              className="flex size-10 pressionavel items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2 disabled:opacity-30"
            >
              <Icone nome="remove" />
            </button>
            <button
              type="button"
              aria-label="15 minutos depois"
              disabled={!proximo}
              onClick={() => proximo && aoMudar({ modo: 'outro', outroEm: proximo.toISOString() })}
              className="flex size-10 pressionavel items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2 disabled:opacity-30"
            >
              <Icone nome="add" />
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
