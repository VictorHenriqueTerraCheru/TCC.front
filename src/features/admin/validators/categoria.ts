import { z } from 'zod'

export const categoriaSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.').max(60, 'Use até 60 caracteres.'),
  tipo: z.enum(['problema', 'incidente']),
  grupo: z.string().min(1, 'Escolha o grupo.'),
  icone: z
    .string()
    .min(1, 'Escolha um ícone.')
    .max(40)
    .regex(/^[a-z0-9_-]+$/, 'Escolha um ícone da lista.'),
})
export type CategoriaForm = z.infer<typeof categoriaSchema>
