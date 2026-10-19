import type { Schema } from '@/infrastructure/api'

export type ProblemaNaArea = Schema<'ListarProblemasNaAreaResponse'>
export type StatusProblema = Schema<'StatusProblema'>
export type FaixaConfianca = Schema<'FaixaConfianca'>
export type DetalheProblema = Schema<'ObterDetalheProblemaResponse'>
/** Resposta a "Ainda está lá?": alimenta a confiança e o ciclo de vida na API. */
export type ValorVoto = Schema<'ValorVotoContrato'>
