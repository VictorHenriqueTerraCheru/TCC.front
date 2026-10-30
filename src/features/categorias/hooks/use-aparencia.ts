import { useMemo } from 'react'

import { useGroups } from '../api/use-grupos'
import {
  appearanceOf,
  groupOf,
  type CategoryAppearance,
  type CategorySummary,
  type Group,
} from '../models/categoria'

const NO_GROUPS: Group[] = []

export function useAppearance() {
  const { data } = useGroups()
  const groups = data ?? NO_GROUPS
  return useMemo(
    () => ({
      groups,
      loaded: data !== undefined,
      groupOf: (category: Pick<CategorySummary, 'group'>) => groupOf(groups, category),
      appearanceOf: (category: Pick<CategorySummary, 'group'>): CategoryAppearance =>
        appearanceOf(groups, category),
    }),
    [groups, data],
  )
}
