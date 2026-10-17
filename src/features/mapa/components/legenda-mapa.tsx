import type { ReactNode } from 'react'

import { Icone } from '@/common/components/icone'
import { gradienteCalorCss } from '@/features/incidentes'
import { PINO } from '@/features/problemas'

import type { ModoMapa } from '../models/filtros'

function Pino({ tracejado = false, className }: { tracejado?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 40 50" className={className} aria-hidden="true">
      <path
        d={PINO}
        fill={tracejado ? '#fff' : 'var(--cat-via-publica)'}
        stroke={tracejado ? 'var(--cat-via-publica)' : 'none'}
        strokeWidth={3}
        strokeDasharray={tracejado ? '5 4' : undefined}
      />
    </svg>
  )
}

function Item({ simbolo, titulo, texto }: { simbolo: ReactNode; titulo: string; texto?: string }) {
  return (
    <li className="flex gap-2.5">
      <span className="flex w-5 shrink-0 items-start justify-center pt-0.5">{simbolo}</span>
      <span>
        <span className="block text-[13px] font-medium">{titulo}</span>
        {texto && <span className="block text-xs text-muted-foreground">{texto}</span>}
      </span>
    </li>
  )
}

/**
 * Tela 2 ("Como ler o mapa", quando há calor) e tela 24 ("Estado do problema", modo Problemas).
 */
export function LegendaMapa({ modo, aoFechar }: { modo: ModoMapa; aoFechar(): void }) {
  const comCalor = modo !== 'problemas'
  const titulo = comCalor ? 'Como ler o mapa' : 'Estado do problema'

  return (
    <section
      aria-label={titulo}
      className="pointer-events-auto w-60 rounded-2xl bg-surface-container-high p-4 shadow-lg"
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">{titulo}</h2>
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar legenda"
          className="-m-1 flex size-7 items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2"
        >
          <Icone nome="close" className="text-[18px]" />
        </button>
      </header>
      {comCalor ? (
        <ul className="space-y-3">
          {modo === 'ambos' && (
            <Item
              simbolo={<Pino className="h-5" />}
              titulo="Problema · marcador"
              texto="Fica no mapa até ser resolvido"
            />
          )}
          <Item
            simbolo={<span className="mt-0.5 size-4 rounded-full bg-calor blur-[1px]" />}
            titulo="Incidente · calor"
            texto="Concentração nos últimos 7 dias"
          />
          <li>
            <div className="h-2 rounded-full" style={{ backgroundImage: gradienteCalorCss }} />
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>Menos</span>
              <span>Mais</span>
            </div>
          </li>
          {modo === 'ambos' && (
            <Item
              simbolo={
                <span className="flex items-end gap-0.5">
                  <Pino className="h-3 opacity-50" />
                  <Pino className="h-5" />
                </span>
              }
              titulo="Maior e mais cheio = mais confiável"
            />
          )}
        </ul>
      ) : (
        <ul className="space-y-3">
          <Item simbolo={<Pino className="h-5" />} titulo="Ativa" />
          <Item simbolo={<Pino tracejado className="h-5" />} titulo="Possivelmente resolvida" />
          <Item
            simbolo={<Icone nome="history" className="text-[18px] text-muted-foreground" />}
            titulo="Resolvidas saem do mapa e ficam só no histórico"
          />
          <Item
            simbolo={
              <span className="rounded bg-nova px-1 text-[9px] leading-4 text-nova-foreground">
                Nova
              </span>
            }
            titulo="Em avaliação"
            texto="Registro recente, com poucos votos"
          />
        </ul>
      )}
    </section>
  )
}
