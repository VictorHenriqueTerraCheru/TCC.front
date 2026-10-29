import type { Schema } from '@/infrastructure/api'

export type CelulaCalor = Schema<'GetIncidentHeatmapResponse'>
export type AreaIncidentes = Schema<'GetIncidentAreaResponse'>
export type NivelConcentracao = Schema<'ConcentrationLevel'>

export function totalSeteDias(area: AreaIncidentes): number {
  return area.counts.reduce((soma, c) => soma + c.days7, 0)
}
