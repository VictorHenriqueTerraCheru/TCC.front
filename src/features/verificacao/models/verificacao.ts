import type { Schema } from '@/infrastructure/api'

export type AffiliationType = Schema<'AffiliationType'>
export type VerificationStatus = Schema<'VerificationStatus'>

export const affiliationLabel: Record<AffiliationType, string> = {
  livesInArea: 'Morador(a) da região',
  worksInArea: 'Trabalha na região',
  publicServant: 'Servidor(a) público(a)',
  other: 'Outro vínculo',
}

export const affiliationTypes = Object.keys(affiliationLabel) as AffiliationType[]
