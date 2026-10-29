import type { Schema } from '@/infrastructure/api'

export type CelulaCalor = Schema<'ObterCalorIncidentesResponse'>
export type AreaIncidentes = Schema<'ObterAreaIncidentesResponse'>
export type NivelConcentracao = Schema<'NivelConcentracao'>

export function totalSeteDias(area: AreaIncidentes): number {
  return area.contagens.reduce((soma, c) => soma + c.dias7, 0)
}
