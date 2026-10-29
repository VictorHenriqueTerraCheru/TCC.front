import type { Schema } from '@/infrastructure/api'

export type TipoVinculo = Schema<'AffiliationType'>
export type StatusVerificacao = Schema<'VerificationStatus'>

export const rotuloVinculo: Record<TipoVinculo, string> = {
  livesInArea: 'Morador(a) da região',
  worksInArea: 'Trabalha na região',
  publicServant: 'Servidor(a) público(a)',
  other: 'Outro vínculo',
}

export const tiposVinculo = Object.keys(rotuloVinculo) as TipoVinculo[]
