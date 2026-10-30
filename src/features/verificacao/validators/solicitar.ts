import { z } from 'zod'

import { affiliationTypes, type AffiliationType } from '../models/verificacao'

export const requestSchema = z.object({
  affiliationType: z.enum(
    affiliationTypes as [AffiliationType, ...AffiliationType[]],
    'Escolha o tipo de vínculo.',
  ),
  justification: z
    .string()
    .trim()
    .min(30, 'Campo obrigatório — escreva pelo menos 30 caracteres.')
    .max(500, 'Use até 500 caracteres.'),
})
export type RequestFormValues = z.infer<typeof requestSchema>
