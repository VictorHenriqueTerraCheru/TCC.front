import { z } from 'zod'

const email = z
  .string()
  .trim()
  .min(1, 'Informe seu e-mail.')
  .pipe(z.email('Informe um e-mail válido.'))

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Informe sua senha.'),
})
export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome.').max(120, 'Use até 120 caracteres.'),
  email,
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
  acceptedTerms: z.boolean().refine((v) => v, 'Aceite os termos para criar a conta.'),
})
export type RegisterFormValues = z.infer<typeof registerSchema>
