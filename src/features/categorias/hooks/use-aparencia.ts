import { useMemo } from 'react'

import { useGrupos } from '../api/use-grupos'
import {
  aparenciaDe,
  grupoDe,
  type AparenciaCategoria,
  type CategoriaResumo,
  type Grupo,
} from '../models/categoria'

const SEM_GRUPOS: Grupo[] = []

export function useAparencia() {
  const { data } = useGrupos()
  const grupos = data ?? SEM_GRUPOS
  return useMemo(
    () => ({
      grupos,
      carregado: data !== undefined,
      grupoDe: (categoria: Pick<CategoriaResumo, 'grupo'>) => grupoDe(grupos, categoria),
      aparenciaDe: (categoria: Pick<CategoriaResumo, 'grupo'>): AparenciaCategoria =>
        aparenciaDe(grupos, categoria),
    }),
    [grupos, data],
  )
}
