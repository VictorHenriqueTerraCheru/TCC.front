import { gruposDoTipo, type Grupo } from '@/features/categorias'
import type { StatusProblema } from '@/features/problemas'

export type ModoMapa = 'problemas' | 'incidentes' | 'ambos'

export const modosMapa: { valor: ModoMapa; rotulo: string }[] = [
  { valor: 'problemas', rotulo: 'Problemas' },
  { valor: 'incidentes', rotulo: 'Incidentes' },
  { valor: 'ambos', rotulo: 'Ambos' },
]

export interface FiltrosMapa {
  modo: ModoMapa
  grupos: string[]
  somenteNovas: boolean
}

export function gruposDoModo(grupos: Grupo[], modo: ModoMapa): Grupo[] {
  if (modo === 'problemas') return gruposDoTipo(grupos, 'problema')
  if (modo === 'incidentes') return gruposDoTipo(grupos, 'incidente')
  return grupos.filter((g) => g.tipo === 'problema' || g.tipo === 'incidente')
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
