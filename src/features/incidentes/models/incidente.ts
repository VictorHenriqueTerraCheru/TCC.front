import type { Schema } from '@/infrastructure/api'

export type CelulaCalor = Schema<'ObterCalorIncidentesResponse'>
export type AreaIncidentes = Schema<'ObterAreaIncidentesResponse'>
export type NivelConcentracao = Schema<'NivelConcentracao'>

/** Soma dos últimos 7 dias: 0 = não abre o resumo (docs/TELAS.md, tela 4). */
export function totalSeteDias(area: AreaIncidentes): number {
  return area.contagens.reduce((soma, c) => soma + c.dias7, 0)
}
