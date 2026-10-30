import type { Schema } from '@/infrastructure/api'

export type HeatmapCell = Schema<'GetIncidentHeatmapResponse'>
export type IncidentArea = Schema<'GetIncidentAreaResponse'>
export type ConcentrationLevel = Schema<'ConcentrationLevel'>

export function sevenDayTotal(area: IncidentArea): number {
  return area.counts.reduce((sum, c) => sum + c.days7, 0)
}
