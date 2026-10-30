import { registerSchema, loginSchema } from './auth'

describe('auth validators', () => {
  it('login requires a valid e-mail and password', () => {
    const r = loginSchema.safeParse({ email: 'not-an-email', password: '' })
    expect(r.success).toBe(false)
    expect(r.error?.flatten().fieldErrors).toEqual({
      email: ['Informe um e-mail válido.'],
      password: ['Informe sua senha.'],
    })
  })

  it('sign up requires password ≥ 8 and accepted terms', () => {
    const r = registerSchema.safeParse({
      name: ' Ana ',
      email: 'ana@x.com',
      password: '1234567',
      acceptedTerms: false,
    })
    expect(r.error?.flatten().fieldErrors).toEqual({
      password: ['Mínimo de 8 caracteres'],
      acceptedTerms: ['Aceite os termos para criar a conta.'],
    })
  })

  it('valid sign up trims the name', () => {
    const r = registerSchema.parse({
      name: '  Mariana Souza ',
      email: 'mariana@email.com',
      password: '12345678',
      acceptedTerms: true,
    })
    expect(r.name).toBe('Mariana Souza')
  })
})
