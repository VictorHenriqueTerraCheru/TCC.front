import type { GroupType } from '@/features/categories'

export function categoryPath(type: GroupType) {
  return `/report/category?type=${type}`
}

export function readType(value: string | null): GroupType | null {
  return value === 'issue' || value === 'incident' ? value : null
}
