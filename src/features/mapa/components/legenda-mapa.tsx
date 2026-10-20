import type { ReactNode } from 'react'

import { Icone } from '@/common/components/icone'
import { aparenciaDaCor } from '@/features/categorias'
import { gradienteCalorCss } from '@/features/incidentes'
import { dimensoesMarcador, MarcadorProblema } from '@/features/problemas'

import type { ModoMapa } from '../models/filtros'

/** Balão em miniatura (o mesmo do mapa) para os itens da legenda. */
function Balao({
  status = 'ativa',
  faixa = 'alta',
  escala = 0.72,
}: {
  status?: 'ativa' | 'possivelmenteResolvida'
  faixa?: 'alta' | 'baixa'
  escala?: number
}) {
  const { largura, altura } = dimensoesMarcador(status, faixa)
  return (
    <span
      className="pointer-events-none block"
      style={{ width: largura * escala, height: altura * escala }}
    >
      <span
        className="block origin-top-left [&_.pulso-alerta]:hidden"
        style={{ transform: `scale(${escala})` }}
      >
        <MarcadorProblema
          cor={aparenciaDaCor.laranja.corForte}
          icone="edit_road"
          status={status}
          faixa={faixa}
        />
      </span>
    </span>
  )
}

function Item({ simbolo, titulo, texto }: { simbolo: ReactNode; titulo: string; texto?: string }) {
  return (
    <li className="flex gap-2.5">
      <span className="flex w-7 shrink-0 items-start justify-center pt-0.5">{simbolo}</span>
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
      className="pointer-events-auto w-60 rounded-[22px] p-4 shadow-lg vidro"
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">{titulo}</h2>
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar legenda"
          className="-m-2.5 flex size-11 items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2"
        >
          <Icone nome="close" className="text-[18px]" />
        </button>
      </header>
      {comCalor ? (
        <ul className="space-y-3">
          {modo === 'ambos' && (
            <Item
              simbolo={<Balao />}
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
                  <Balao faixa="baixa" escala={0.5} />
                  <Balao faixa="alta" escala={0.55} />
                </span>
              }
              titulo="Maior e mais cheio = mais confiável"
            />
          )}
        </ul>
      ) : (
        <ul className="space-y-3">
          <Item simbolo={<Balao />} titulo="Ativa" />
          <Item
            simbolo={<Balao status="possivelmenteResolvida" />}
            titulo="Possivelmente resolvida"
          />
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
