import { groupsOfType, type Group } from '@/features/categorias'
import type { IssueStatus } from '@/features/problemas'

export type MapMode = 'issues' | 'incidents' | 'both'

export const mapModes: { value: MapMode; label: string }[] = [
  { value: 'issues', label: 'Problemas' },
  { value: 'incidents', label: 'Incidentes' },
  { value: 'both', label: 'Ambos' },
]

export interface MapFilters {
  mode: MapMode
  groups: string[]
  onlyNew: boolean
}

export function modeGroups(groups: Group[], mode: MapMode): Group[] {
  if (mode === 'issues') return groupsOfType(groups, 'issue')
  if (mode === 'incidents') return groupsOfType(groups, 'incident')
  return groups.filter((g) => g.type === 'issue' || g.type === 'incident')
}

export function showsIssues(mode: MapMode) {
  return mode !== 'incidents'
}

export function showsHeatmap(mode: MapMode) {
  return mode !== 'issues'
}

interface LayerFilters {
  issues: { groups: string[]; status: IssueStatus[] } | null
  heatmap: { groups: string[] } | null
}

export function layerFilters({ mode, groups, onlyNew }: MapFilters, all: Group[]): LayerFilters {
  const ofType = (type: Group['type']) => {
    const keys = new Set(groupsOfType(all, type).map((g) => g.key))
    return groups.filter((g) => keys.has(g))
  }
  const anyChecked = groups.length > 0
  const forIssue = ofType('issue')
  const forIncident = ofType('incident')

  const issuesOn = showsIssues(mode) && (!anyChecked || forIssue.length > 0)
  const heatmapOn = showsHeatmap(mode) && (!anyChecked || forIncident.length > 0)

  return {
    issues: issuesOn ? { groups: forIssue, status: onlyNew ? ['new'] : [] } : null,
    heatmap: heatmapOn ? { groups: forIncident } : null,
  }
}
