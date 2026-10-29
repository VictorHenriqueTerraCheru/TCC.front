import type { TipoGrupo } from '@/features/categorias'

export function caminhoDaCategoria(tipo: TipoGrupo) {
  return `/registrar/categoria?tipo=${tipo}`
}

export function lerTipo(valor: string | null): TipoGrupo | null {
  return valor === 'issue' || valor === 'incident' ? valor : null
}
