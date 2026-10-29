import { gruposDoTipo, type Grupo } from '@/features/categorias'
import type { StatusProblema } from '@/features/problemas'

export type ModoMapa = 'problemas' | 'incidentes' | 'ambos'

export const modosMapa: { value: ModoMapa; label: string }[] = [
  { value: 'problemas', label: 'Problemas' },
  { value: 'incidentes', label: 'Incidentes' },
  { value: 'ambos', label: 'Ambos' },
]

export interface FiltrosMapa {
  modo: ModoMapa
  grupos: string[]
  somenteNovas: boolean
}

export function gruposDoModo(grupos: Grupo[], modo: ModoMapa): Grupo[] {
  if (modo === 'problemas') return gruposDoTipo(grupos, 'issue')
  if (modo === 'incidentes') return gruposDoTipo(grupos, 'incident')
  return grupos.filter((g) => g.type === 'issue' || g.type === 'incident')
}

export function mostraProblemas(modo: ModoMapa) {
  return modo !== 'incidentes'
}

export function mostraCalor(modo: ModoMapa) {
  return modo !== 'problemas'
}

interface FiltrosCamadas {
  problemas: { grupos: string[]; status: StatusProblema[] } | null
  calor: { grupos: string[] } | null
}

export function filtrosDasCamadas(
  { modo, grupos, somenteNovas }: FiltrosMapa,
  todos: Grupo[],
): FiltrosCamadas {
  const doTipo = (tipo: Grupo['type']) => {
    const chaves = new Set(gruposDoTipo(todos, tipo).map((g) => g.key))
    return grupos.filter((g) => chaves.has(g))
  }
  const algumMarcado = grupos.length > 0
  const deProblema = doTipo('issue')
  const deIncidente = doTipo('incident')

  const problemasLigado = mostraProblemas(modo) && (!algumMarcado || deProblema.length > 0)
  const calorLigado = mostraCalor(modo) && (!algumMarcado || deIncidente.length > 0)

  return {
    problemas: problemasLigado ? { grupos: deProblema, status: somenteNovas ? ['new'] : [] } : null,
    calor: calorLigado ? { grupos: deIncidente } : null,
  }
}
