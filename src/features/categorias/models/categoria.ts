import type { Schema } from '@/infrastructure/api'

export type Categoria = Schema<'ListCategoriesResponse'>
export type CategoriaResumo = Schema<'CategorySummary'>
export type Grupo = Schema<'GroupResponse'>

export type CorGrupo = Grupo['color']

export type TipoGrupo = Categoria['type']

export interface AparenciaDaCor {
  forte: string
  claro: string
  corForte: string
}

export interface AparenciaCategoria extends AparenciaDaCor {
  label: string
}

export const aparenciaDaCor: Record<CorGrupo, AparenciaDaCor> = {
  orange: {
    forte: 'text-cat-laranja',
    claro: 'bg-cat-laranja-claro',
    corForte: 'var(--cat-laranja)',
  },
  ochre: { forte: 'text-cat-ocre', claro: 'bg-cat-ocre-claro', corForte: 'var(--cat-ocre)' },
  brown: { forte: 'text-cat-marrom', claro: 'bg-cat-marrom-claro', corForte: 'var(--cat-marrom)' },
  red: {
    forte: 'text-cat-vermelho',
    claro: 'bg-cat-vermelho-claro',
    corForte: 'var(--cat-vermelho)',
  },
  terracotta: {
    forte: 'text-cat-terracota',
    claro: 'bg-cat-terracota-claro',
    corForte: 'var(--cat-terracota)',
  },
  blue: { forte: 'text-cat-azul', claro: 'bg-cat-azul-claro', corForte: 'var(--cat-azul)' },
  teal: {
    forte: 'text-cat-verde-agua',
    claro: 'bg-cat-verde-agua-claro',
    corForte: 'var(--cat-verde-agua)',
  },
  purple: { forte: 'text-cat-roxo', claro: 'bg-cat-roxo-claro', corForte: 'var(--cat-roxo)' },
  pink: { forte: 'text-cat-rosa', claro: 'bg-cat-rosa-claro', corForte: 'var(--cat-rosa)' },
  gray: { forte: 'text-cat-cinza', claro: 'bg-cat-cinza-claro', corForte: 'var(--cat-cinza)' },
}

export const coresGrupo = Object.keys(aparenciaDaCor) as CorGrupo[]

export const nomeDaCor: Record<CorGrupo, string> = {
  orange: 'Laranja',
  ochre: 'Ocre',
  brown: 'Marrom',
  red: 'Vermelho',
  terracotta: 'Terracota',
  blue: 'Azul',
  teal: 'Verde-água',
  purple: 'Roxo',
  pink: 'Rosa',
  gray: 'Cinza',
}

const iconeLegado: Record<string, string> = {
  buraco: 'edit_road',
  calcada: 'directions_walk',
  poste: 'light_off',
  fio: 'bolt',
  descarte: 'delete',
  lixo: 'delete_sweep',
  roubo: 'error',
  acidente: 'car_crash',
}

export const ICONE_PADRAO = 'category'

export function gruposDoTipo(grupos: Grupo[], tipo: TipoGrupo): Grupo[] {
  return grupos.filter((g) => g.type === tipo)
}

export function grupoDe(
  grupos: Grupo[],
  categoria: Pick<CategoriaResumo, 'group'>,
): Grupo | undefined {
  return grupos.find((g) => g.key === categoria.group)
}

export function aparenciaDe(
  grupos: Grupo[],
  categoria: Pick<CategoriaResumo, 'group'>,
): AparenciaCategoria {
  const grupo = grupoDe(grupos, categoria)
  return { label: grupo?.label ?? categoria.group, ...aparenciaDaCor[grupo?.color ?? 'gray'] }
}

export function iconeDe(categoria: Pick<CategoriaResumo, 'icon'>): string {
  return iconeLegado[categoria.icon] ?? categoria.icon
}
