import type { Schema } from '@/infrastructure/api'

export type ProblemaNaArea = Schema<'ListIssuesInAreaResponse'>
export type StatusProblema = Schema<'IssueStatus'>
export type FaixaConfianca = Schema<'TrustBand'>
export type DetalheProblema = Schema<'GetIssueDetailResponse'>
export type ValorVoto = Schema<'VoteAnswer'>
