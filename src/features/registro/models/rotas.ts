import type { TipoGrupo } from '@/features/categorias'

export function caminhoDaCategoria(tipo: TipoGrupo) {
  return `/registrar/categoria?tipo=${tipo}`
}

export function lerTipo(valor: string | null): TipoGrupo | null {
  return valor === 'problema' || valor === 'incidente' ? valor : null
}
