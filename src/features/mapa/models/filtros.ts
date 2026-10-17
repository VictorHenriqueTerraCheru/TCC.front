import { gruposDoTipo, type GrupoCategoria } from '@/features/categorias'
import type { StatusProblema } from '@/features/problemas'

/** Seletor das telas 1/2: Problemas mostra marcadores, Incidentes só calor, Ambos os dois. */
export type ModoMapa = 'problemas' | 'incidentes' | 'ambos'

export const modosMapa: { valor: ModoMapa; rotulo: string }[] = [
  { valor: 'problemas', rotulo: 'Problemas' },
  { valor: 'incidentes', rotulo: 'Incidentes' },
  { valor: 'ambos', rotulo: 'Ambos' },
]

export interface FiltrosMapa {
  modo: ModoMapa
  /** Chips de grupo marcados; vazio = todos. */
  grupos: GrupoCategoria[]
  /** Chip de ampulheta: só problemas "Em avaliação" (status=nova). */
  somenteNovas: boolean
}

const gruposProblema = gruposDoTipo('problema')
const gruposIncidente = gruposDoTipo('incidente')

/** Chips de grupo disponíveis em cada modo (os de problema, os de incidente ou ambos). */
export function gruposDoModo(modo: ModoMapa): GrupoCategoria[] {
  if (modo === 'problemas') return gruposProblema
  if (modo === 'incidentes') return gruposIncidente
  return [...gruposProblema, ...gruposIncidente]
}

export function mostraProblemas(modo: ModoMapa) {
  return modo !== 'incidentes'
}

export function mostraCalor(modo: ModoMapa) {
  return modo !== 'problemas'
}

interface FiltrosCamadas {
  /** null = camada de problemas desligada. */
  problemas: { grupos: GrupoCategoria[]; status: StatusProblema[] } | null
  /** null = camada de calor desligada. */
  calor: { grupos: GrupoCategoria[] } | null
}

/**
 * Traduz os chips para os parâmetros de cada camada. Com algum grupo marcado, uma camada
 * sem nenhum grupo seu marcado some (ex.: Ambos + só "Segurança" = só o calor de roubos).
 */
export function filtrosDasCamadas({ modo, grupos, somenteNovas }: FiltrosMapa): FiltrosCamadas {
  const doTipo = (lista: GrupoCategoria[]) => grupos.filter((g) => lista.includes(g))
  const algumMarcado = grupos.length > 0
  const deProblema = doTipo(gruposProblema)
  const deIncidente = doTipo(gruposIncidente)

  const problemasLigado = mostraProblemas(modo) && (!algumMarcado || deProblema.length > 0)
  const calorLigado = mostraCalor(modo) && (!algumMarcado || deIncidente.length > 0)

  return {
    problemas: problemasLigado
      ? { grupos: deProblema, status: somenteNovas ? ['nova'] : [] }
      : null,
    calor: calorLigado ? { grupos: deIncidente } : null,
  }
}
