import type { Schema } from '@/infrastructure/api'

export type TipoVinculo = Schema<'TipoVinculo'>
export type StatusVerificacao = Schema<'StatusVerificacao'>

export const rotuloVinculo: Record<TipoVinculo, string> = {
  moradorRegiao: 'Morador(a) da região',
  trabalhaRegiao: 'Trabalha na região',
  servidorPublico: 'Servidor(a) público(a)',
  outro: 'Outro vínculo',
}

export const tiposVinculo = Object.keys(rotuloVinculo) as TipoVinculo[]
