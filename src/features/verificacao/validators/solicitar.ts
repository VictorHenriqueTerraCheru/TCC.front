import { z } from 'zod'

import { tiposVinculo, type TipoVinculo } from '../models/verificacao'

export const solicitarSchema = z.object({
  affiliationType: z.enum(
    tiposVinculo as [TipoVinculo, ...TipoVinculo[]],
    'Escolha o tipo de vínculo.',
  ),
  justification: z
    .string()
    .trim()
    .min(30, 'Campo obrigatório — escreva pelo menos 30 caracteres.')
    .max(500, 'Use até 500 caracteres.'),
})
export type SolicitarForm = z.infer<typeof solicitarSchema>
