import type { GroupType } from '@/features/categorias'

export function categoryPath(type: GroupType) {
  return `/registrar/categoria?type=${type}`
}

export function readType(value: string | null): GroupType | null {
  return value === 'issue' || value === 'incident' ? value : null
}
