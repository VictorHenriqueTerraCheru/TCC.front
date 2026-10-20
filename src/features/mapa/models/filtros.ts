import { gruposDoTipo, type Grupo } from '@/features/categorias'
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
  /** Chaves dos chips de grupo marcados; vazio = todos. */
  grupos: string[]
  /** Chip de ampulheta: só problemas "Em avaliação" (status=nova). */
  somenteNovas: boolean
}

/** Chips de grupo disponíveis em cada modo (os de problema, os de incidente ou ambos). */
export function gruposDoModo(grupos: Grupo[], modo: ModoMapa): Grupo[] {
  if (modo === 'problemas') return gruposDoTipo(grupos, 'problema')
  if (modo === 'incidentes') return gruposDoTipo(grupos, 'incidente')
  return [...gruposDoTipo(grupos, 'problema'), ...gruposDoTipo(grupos, 'incidente')]
}

export function mostraProblemas(modo: ModoMapa) {
  return modo !== 'incidentes'
}

export function mostraCalor(modo: ModoMapa) {
  return modo !== 'problemas'
}

interface FiltrosCamadas {
  /** null = camada de problemas desligada. */
  problemas: { grupos: string[]; status: StatusProblema[] } | null
  /** null = camada de calor desligada. */
  calor: { grupos: string[] } | null
}

/**
 * Traduz os chips para os parâmetros de cada camada. Com algum grupo marcado, uma camada
 * sem nenhum grupo seu marcado some (ex.: Ambos + só "Segurança" = só o calor de roubos).
 */
export function filtrosDasCamadas(
  { modo, grupos, somenteNovas }: FiltrosMapa,
  todos: Grupo[],
): FiltrosCamadas {
  const doTipo = (tipo: Grupo['tipo']) => {
    const chaves = new Set(gruposDoTipo(todos, tipo).map((g) => g.chave))
    return grupos.filter((g) => chaves.has(g))
  }
  const algumMarcado = grupos.length > 0
  const deProblema = doTipo('problema')
  const deIncidente = doTipo('incidente')

  const problemasLigado = mostraProblemas(modo) && (!algumMarcado || deProblema.length > 0)
  const calorLigado = mostraCalor(modo) && (!algumMarcado || deIncidente.length > 0)

  return {
    problemas: problemasLigado
      ? { grupos: deProblema, status: somenteNovas ? ['nova'] : [] }
      : null,
    calor: calorLigado ? { grupos: deIncidente } : null,
  }
}
