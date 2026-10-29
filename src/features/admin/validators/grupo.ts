import { z } from 'zod'

import { coresGrupo, type CorGrupo } from '@/features/categorias'

export const grupoSchema = z.object({
  rotulo: z.string().trim().min(1, 'Informe o nome.').max(40, 'Use até 40 caracteres.'),
  tipo: z.enum(['problema', 'incidente']),
  cor: z.enum(coresGrupo as [CorGrupo, ...CorGrupo[]], 'Escolha a cor.'),
  ordem: z
    .number('Informe a ordem.')
    .int('Use um número inteiro.')
    .min(1, 'Use 1 ou mais.')
    .max(100_000, 'Use até 100000.'),
})
export type GrupoForm = z.infer<typeof grupoSchema>
