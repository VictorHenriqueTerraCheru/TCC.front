import type { MaterialSymbol } from 'material-symbols'

import type { Schema } from '@/infrastructure/api'

export type Categoria = Schema<'ListarCategoriasResponse'>
export type CategoriaResumo = Schema<'CategoriaResumo'>

// O OpenAPI descreve `grupo` e `icone` como string; os valores vêm do seed fixo (docs/API.md).
export type GrupoCategoria = 'viaPublica' | 'eletrica' | 'limpeza' | 'seguranca' | 'transito'

interface AparenciaGrupo {
  rotulo: string
  icone: MaterialSymbol
  /** Classes Tailwind com os tokens de categoria de src/index.css. */
  forte: string
  claro: string
}

export const aparenciaDoGrupo: Record<GrupoCategoria, AparenciaGrupo> = {
  viaPublica: {
    rotulo: 'Via pública',
    icone: 'edit_road',
    forte: 'text-cat-via-publica',
    claro: 'bg-cat-via-publica-claro',
  },
  eletrica: {
    rotulo: 'Elétrica',
    icone: 'bolt',
    forte: 'text-cat-eletrica',
    claro: 'bg-cat-eletrica-claro',
  },
  limpeza: {
    rotulo: 'Limpeza',
    icone: 'delete',
    forte: 'text-cat-limpeza',
    claro: 'bg-cat-limpeza-claro',
  },
  seguranca: {
    rotulo: 'Segurança',
    icone: 'error',
    forte: 'text-cat-seguranca',
    claro: 'bg-cat-seguranca-claro',
  },
  transito: {
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

export function grupoDe(categoria: Pick<CategoriaResumo, 'grupo'>): GrupoCategoria {
  return categoria.grupo in aparenciaDoGrupo ? (categoria.grupo as GrupoCategoria) : 'viaPublica'
}

export function iconeDe(categoria: Pick<CategoriaResumo, 'icone' | 'grupo'>): MaterialSymbol {
  return iconeDaCategoria[categoria.icone] ?? aparenciaDoGrupo[grupoDe(categoria)].icone
}
