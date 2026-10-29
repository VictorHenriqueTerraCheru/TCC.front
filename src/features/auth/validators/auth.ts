import { z } from 'zod'

const email = z
  .string()
  .trim()
  .min(1, 'Informe seu e-mail.')
  .pipe(z.email('Informe um e-mail válido.'))

export const entrarSchema = z.object({
  email,
  password: z.string().min(1, 'Informe sua senha.'),
})
export type EntrarForm = z.infer<typeof entrarSchema>

export const cadastrarSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome.').max(120, 'Use até 120 caracteres.'),
  email,
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
  acceptedTerms: z.boolean().refine((v) => v, 'Aceite os termos para criar a conta.'),
})
export type CadastrarForm = z.infer<typeof cadastrarSchema>
