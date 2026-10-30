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
    strong: 'text-group-orange',
    light: 'bg-group-orange-light',
    strongColor: 'var(--group-orange)',
  },
  ochre: {
    strong: 'text-group-ochre',
    light: 'bg-group-ochre-light',
    strongColor: 'var(--group-ochre)',
  },
  brown: {
    strong: 'text-group-brown',
    light: 'bg-group-brown-light',
    strongColor: 'var(--group-brown)',
  },
  red: {
    strong: 'text-group-red',
    light: 'bg-group-red-light',
    strongColor: 'var(--group-red)',
  },
  terracotta: {
    strong: 'text-group-terracotta',
    light: 'bg-group-terracotta-light',
    strongColor: 'var(--group-terracotta)',
  },
  blue: {
    strong: 'text-group-blue',
    light: 'bg-group-blue-light',
    strongColor: 'var(--group-blue)',
  },
  teal: {
    strong: 'text-group-teal',
    light: 'bg-group-teal-light',
    strongColor: 'var(--group-teal)',
  },
  purple: {
    strong: 'text-group-purple',
    light: 'bg-group-purple-light',
    strongColor: 'var(--group-purple)',
  },
  pink: {
    strong: 'text-group-pink',
    light: 'bg-group-pink-light',
    strongColor: 'var(--group-pink)',
  },
  gray: {
    strong: 'text-group-gray',
    light: 'bg-group-gray-light',
    strongColor: 'var(--group-gray)',
  },
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
