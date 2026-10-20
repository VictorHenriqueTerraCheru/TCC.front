import { z } from 'zod'

import { tiposVinculo, type TipoVinculo } from '../models/verificacao'

// Mesmas regras da API: 30 a 500 caracteres depois de remover espaços nas pontas.
export const solicitarSchema = z.object({
  tipoVinculo: z.enum(
    tiposVinculo as [TipoVinculo, ...TipoVinculo[]],
    'Escolha o tipo de vínculo.',
  ),
  justificativa: z
    .string()
    .trim()
    .min(30, 'Campo obrigatório — escreva pelo menos 30 caracteres.')
    .max(500, 'Use até 500 caracteres.'),
})
export type SolicitarForm = z.infer<typeof solicitarSchema>
