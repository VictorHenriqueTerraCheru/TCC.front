import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome.').max(60, 'Use até 60 caracteres.'),
  type: z.enum(['issue', 'incident']),
  group: z.string().min(1, 'Escolha o grupo.'),
  icon: z
    .string()
    .min(1, 'Escolha um ícone.')
    .max(40)
    .regex(/^[a-z0-9_-]+$/, 'Escolha um ícone da lista.'),
})
export type CategoryFormValues = z.infer<typeof categorySchema>
