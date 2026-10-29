import type { Schema } from '@/infrastructure/api'

export type Categoria = Schema<'ListarCategoriasResponse'>
export type CategoriaResumo = Schema<'CategoriaResumo'>
export type Grupo = Schema<'GrupoResponse'>

export type CorGrupo = Grupo['cor']

export type TipoGrupo = Categoria['tipo']

export interface AparenciaDaCor {
  forte: string
  claro: string
  corForte: string
}

export interface AparenciaCategoria extends AparenciaDaCor {
  rotulo: string
}

export const aparenciaDaCor: Record<CorGrupo, AparenciaDaCor> = {
  laranja: {
    forte: 'text-cat-laranja',
    claro: 'bg-cat-laranja-claro',
    corForte: 'var(--cat-laranja)',
  },
  ocre: { forte: 'text-cat-ocre', claro: 'bg-cat-ocre-claro', corForte: 'var(--cat-ocre)' },
  marrom: { forte: 'text-cat-marrom', claro: 'bg-cat-marrom-claro', corForte: 'var(--cat-marrom)' },
  vermelho: {
    forte: 'text-cat-vermelho',
    claro: 'bg-cat-vermelho-claro',
    corForte: 'var(--cat-vermelho)',
  },
  terracota: {
    forte: 'text-cat-terracota',
    claro: 'bg-cat-terracota-claro',
    corForte: 'var(--cat-terracota)',
  },
  azul: { forte: 'text-cat-azul', claro: 'bg-cat-azul-claro', corForte: 'var(--cat-azul)' },
  verdeAgua: {
    forte: 'text-cat-verde-agua',
    claro: 'bg-cat-verde-agua-claro',
    corForte: 'var(--cat-verde-agua)',
  },
  roxo: { forte: 'text-cat-roxo', claro: 'bg-cat-roxo-claro', corForte: 'var(--cat-roxo)' },
  rosa: { forte: 'text-cat-rosa', claro: 'bg-cat-rosa-claro', corForte: 'var(--cat-rosa)' },
  cinza: { forte: 'text-cat-cinza', claro: 'bg-cat-cinza-claro', corForte: 'var(--cat-cinza)' },
}

export const coresGrupo = Object.keys(aparenciaDaCor) as CorGrupo[]

export const nomeDaCor: Record<CorGrupo, string> = {
  laranja: 'Laranja',
  ocre: 'Ocre',
  marrom: 'Marrom',
  vermelho: 'Vermelho',
  terracota: 'Terracota',
  azul: 'Azul',
  verdeAgua: 'Verde-água',
  roxo: 'Roxo',
  rosa: 'Rosa',
  cinza: 'Cinza',
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
  return grupos.filter((g) => g.tipo === tipo)
}

export function grupoDe(
  grupos: Grupo[],
  categoria: Pick<CategoriaResumo, 'grupo'>,
): Grupo | undefined {
  return grupos.find((g) => g.chave === categoria.grupo)
}

export function aparenciaDe(
  grupos: Grupo[],
  categoria: Pick<CategoriaResumo, 'grupo'>,
): AparenciaCategoria {
  const grupo = grupoDe(grupos, categoria)
  return { rotulo: grupo?.rotulo ?? categoria.grupo, ...aparenciaDaCor[grupo?.cor ?? 'cinza'] }
}

export function iconeDe(categoria: Pick<CategoriaResumo, 'icone'>): string {
  return iconeLegado[categoria.icone] ?? categoria.icone
}
