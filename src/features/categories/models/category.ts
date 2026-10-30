import type { Schema } from '@/infrastructure/api'

export type Category = Schema<'ListCategoriesResponse'>
export type CategorySummary = Schema<'CategorySummary'>
export type Group = Schema<'GroupResponse'>

export type GroupColor = Group['color']

export type GroupType = Category['type']

export interface ColorAppearance {
  strong: string
  light: string
  strongColor: string
}

export interface CategoryAppearance extends ColorAppearance {
  label: string
}

export const colorAppearance: Record<GroupColor, ColorAppearance> = {
  orange: {
    strong: 'text-cat-laranja',
    light: 'bg-cat-laranja-claro',
    strongColor: 'var(--cat-laranja)',
  },
  ochre: { strong: 'text-cat-ocre', light: 'bg-cat-ocre-claro', strongColor: 'var(--cat-ocre)' },
  brown: {
    strong: 'text-cat-marrom',
    light: 'bg-cat-marrom-claro',
    strongColor: 'var(--cat-marrom)',
  },
  red: {
    strong: 'text-cat-vermelho',
    light: 'bg-cat-vermelho-claro',
    strongColor: 'var(--cat-vermelho)',
  },
  terracotta: {
    strong: 'text-cat-terracota',
    light: 'bg-cat-terracota-claro',
    strongColor: 'var(--cat-terracota)',
  },
  blue: { strong: 'text-cat-azul', light: 'bg-cat-azul-claro', strongColor: 'var(--cat-azul)' },
  teal: {
    strong: 'text-cat-verde-agua',
    light: 'bg-cat-verde-agua-claro',
    strongColor: 'var(--cat-verde-agua)',
  },
  purple: { strong: 'text-cat-roxo', light: 'bg-cat-roxo-claro', strongColor: 'var(--cat-roxo)' },
  pink: { strong: 'text-cat-rosa', light: 'bg-cat-rosa-claro', strongColor: 'var(--cat-rosa)' },
  gray: { strong: 'text-cat-cinza', light: 'bg-cat-cinza-claro', strongColor: 'var(--cat-cinza)' },
}

export const groupColors = Object.keys(colorAppearance) as GroupColor[]

export const colorName: Record<GroupColor, string> = {
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

const legacyIcon: Record<string, string> = {
  buraco: 'edit_road',
  calcada: 'directions_walk',
  poste: 'light_off',
  fio: 'bolt',
  descarte: 'delete',
  lixo: 'delete_sweep',
  roubo: 'error',
  acidente: 'car_crash',
}

export const DEFAULT_ICON = 'category'

export function groupsOfType(groups: Group[], type: GroupType): Group[] {
  return groups.filter((g) => g.type === type)
}

export function groupOf(
  groups: Group[],
  category: Pick<CategorySummary, 'group'>,
): Group | undefined {
  return groups.find((g) => g.key === category.group)
}

export function appearanceOf(
  groups: Group[],
  category: Pick<CategorySummary, 'group'>,
): CategoryAppearance {
  const group = groupOf(groups, category)
  return { label: group?.label ?? category.group, ...colorAppearance[group?.color ?? 'gray'] }
}

export function iconOf(category: Pick<CategorySummary, 'icon'>): string {
  return legacyIcon[category.icon] ?? category.icon
}
