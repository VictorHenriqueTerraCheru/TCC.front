import { z } from 'zod'

import { coresGrupo, type CorGrupo } from '@/features/categorias'

// Mesmas regras da API (GrupoValidators.cs).
export const grupoSchema = z.object({
  rotulo: z.string().trim().min(1, 'Informe o nome.').max(40, 'Use até 40 caracteres.'),
  tipo: z.enum(['problema', 'incidente']),
  cor: z.enum(coresGrupo as [CorGrupo, ...CorGrupo[]], 'Escolha a cor.'),
  ordem: z.number().int().min(1, 'Use 1 ou mais.').max(1000, 'Use até 1000.'),
})
export type GrupoForm = z.infer<typeof grupoSchema>
