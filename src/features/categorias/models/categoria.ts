import type { MaterialSymbol } from 'material-symbols'

import type { Schema } from '@/infrastructure/api'

export type Categoria = Schema<'ListarCategoriasResponse'>
export type CategoriaResumo = Schema<'CategoriaResumo'>

// O OpenAPI descreve `grupo` e `icone` como string; os valores vêm do seed fixo (docs/API.md).
export type GrupoCategoria = 'viaPublica' | 'eletrica' | 'limpeza' | 'seguranca' | 'transito'

export type TipoGrupo = Categoria['tipo']

interface AparenciaGrupo {
  rotulo: string
  tipo: TipoGrupo
  icone: MaterialSymbol
  /** Classes Tailwind com os tokens de categoria de src/index.css. */
  forte: string
  claro: string
  /** Cor forte como valor CSS, para HTML fora do React (marcadores do Leaflet). */
  corForte: string
}

export const aparenciaDoGrupo: Record<GrupoCategoria, AparenciaGrupo> = {
  viaPublica: {
    tipo: 'problema',
    corForte: 'var(--cat-via-publica)',
    rotulo: 'Via pública',
    icone: 'edit_road',
    forte: 'text-cat-via-publica',
    claro: 'bg-cat-via-publica-claro',
  },
  eletrica: {
    tipo: 'problema',
    corForte: 'var(--cat-eletrica)',
    rotulo: 'Elétrica',
    icone: 'bolt',
    forte: 'text-cat-eletrica',
    claro: 'bg-cat-eletrica-claro',
  },
  limpeza: {
    tipo: 'problema',
    corForte: 'var(--cat-limpeza)',
    rotulo: 'Limpeza',
    icone: 'delete',
    forte: 'text-cat-limpeza',
    claro: 'bg-cat-limpeza-claro',
  },
  seguranca: {
    tipo: 'incidente',
    corForte: 'var(--cat-seguranca)',
    rotulo: 'Segurança',
    icone: 'error',
    forte: 'text-cat-seguranca',
    claro: 'bg-cat-seguranca-claro',
  },
  transito: {
    tipo: 'incidente',
    corForte: 'var(--cat-transito)',
    rotulo: 'Trânsito',
    icone: 'car_crash',
    forte: 'text-cat-transito',
    claro: 'bg-cat-transito-claro',
  },
}

const iconeDaCategoria: Record<string, MaterialSymbol> = {
  buraco: 'edit_road',
  calcada: 'directions_walk',
  poste: 'light_off',
  fio: 'bolt',
  descarte: 'delete',
  lixo: 'delete_sweep',
  roubo: 'error',
  acidente: 'car_crash',
}

export const gruposCategoria = Object.keys(aparenciaDoGrupo) as GrupoCategoria[]

export function gruposDoTipo(tipo: TipoGrupo): GrupoCategoria[] {
  return gruposCategoria.filter((grupo) => aparenciaDoGrupo[grupo].tipo === tipo)
}

export function isGrupoCategoria(valor: string): valor is GrupoCategoria {
  return valor in aparenciaDoGrupo
}

export function grupoDe(categoria: Pick<CategoriaResumo, 'grupo'>): GrupoCategoria {
  return isGrupoCategoria(categoria.grupo) ? categoria.grupo : 'viaPublica'
}

export function iconeDe(categoria: Pick<CategoriaResumo, 'icone' | 'grupo'>): MaterialSymbol {
  return iconeDaCategoria[categoria.icone] ?? aparenciaDoGrupo[grupoDe(categoria)].icone
}
