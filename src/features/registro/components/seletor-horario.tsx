import { Icone } from '@/common/components/icone'
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

/** "Quando aconteceu?" da tela 21a, com o stepper de 15 min limitado à janela (regra 16). */
export function SeletorHorario({ horario, aoMudar }: SeletorHorarioProps) {
  const agora = new Date()
  const escolhido = horario.outroEm ? new Date(horario.outroEm) : horarioInicialOutro(agora)
  const anterior = passoHorario(escolhido, -1, agora)
  const proximo = passoHorario(escolhido, 1, agora)

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
                'flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium focus-visible:outline-2',
                selecionado
                  ? 'border-transparent bg-primario-suave text-primario'
                  : 'border-input hover:bg-foreground/5',
              )}
            >
              {selecionado && <Icone nome="check" className="text-[18px]" />}
              {rotulo}
            </button>
          )
        })}
      </div>

      {horario.modo === 'outro' && (
        <div className="mt-4">
          <div className="relative flex h-14 items-center rounded-md border-2 border-primario pr-2 pl-4">
            <span className="absolute -top-2 left-3 bg-card px-1 text-xs text-primario">
              Hora aproximada
            </span>
            <output aria-live="polite" className="flex-1">
              {descreverHorarioCurto(escolhido)}
            </output>
            <button
              type="button"
              aria-label="15 minutos antes"
              disabled={!anterior}
              onClick={() =>
                anterior && aoMudar({ modo: 'outro', outroEm: anterior.toISOString() })
              }
              className="flex size-10 items-center justify-center rounded-full hover:bg-foreground/5 disabled:opacity-30"
            >
              <Icone nome="remove" />
            </button>
            <button
              type="button"
              aria-label="15 minutos depois"
              disabled={!proximo}
              onClick={() => proximo && aoMudar({ modo: 'outro', outroEm: proximo.toISOString() })}
              className="flex size-10 items-center justify-center rounded-full hover:bg-foreground/5 disabled:opacity-30"
            >
              <Icone nome="add" />
            </button>
          </div>
          <p className="mt-1 px-4 text-xs text-muted-foreground">
            Registros de incidentes aceitam até 24 h
          </p>
        </div>
      )}
    </section>
  )
}
