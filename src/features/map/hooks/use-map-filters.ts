import { useSearchParams } from 'react-router'

import { useAppearance } from '@/features/categories'

import { modeGroups, showsIssues, type MapFilters, type MapMode } from '../models/filters'

function readMode(value: string | null): MapMode {
  return value === 'incidents' || value === 'both' ? value : 'issues'
}

export function useMapFilters() {
  const [params, setParams] = useSearchParams()
  const { groups: all, loaded } = useAppearance()

  const mode = readMode(params.get('mode'))
  const available = modeGroups(all, mode).map((g) => g.key)
  const filters: MapFilters = {
    mode,
    groups: (params.get('groups') ?? '')
      .split(',')
      .filter((g) => g !== '' && (!loaded || available.includes(g))),
    onlyNew: params.get('new') === '1',
  }

  function save({ mode, groups, onlyNew }: MapFilters) {
    setParams(
      (earlier) => {
        const upcoming = new URLSearchParams(earlier)
        if (mode === 'issues') upcoming.delete('mode')
        else upcoming.set('mode', mode)
        if (groups.length) upcoming.set('groups', groups.join(','))
        else upcoming.delete('groups')
        if (onlyNew) upcoming.set('new', '1')
        else upcoming.delete('new')
        return upcoming
      },
      { replace: true },
    )
  }

  return {
    ...filters,
    setMode(mode: MapMode) {
      const available = modeGroups(all, mode).map((g) => g.key)
      save({
        mode,
        groups: loaded ? filters.groups.filter((g) => available.includes(g)) : filters.groups,
        onlyNew: filters.onlyNew && showsIssues(mode),
      })
    },
    toggleGroup(group: string) {
      const groups = filters.groups.includes(group)
        ? filters.groups.filter((g) => g !== group)
        : [...filters.groups, group]
      save({ ...filters, groups })
    },
    toggleNew() {
      save({ ...filters, onlyNew: !filters.onlyNew })
    },
  }
}
