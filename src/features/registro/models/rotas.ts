import type { TipoGrupo } from '@/features/categorias'

/** Passo 1b do registro: a lista de categorias do tipo escolhido no passo 1a (`/registrar`). */
export function caminhoDaCategoria(tipo: TipoGrupo) {
  return `/registrar/categoria?tipo=${tipo}`
}

export function lerTipo(valor: string | null): TipoGrupo | null {
  return valor === 'problema' || valor === 'incidente' ? valor : null
}
