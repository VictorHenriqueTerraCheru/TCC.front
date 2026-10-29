import { cadastrarSchema, entrarSchema } from './auth'

describe('validadores de auth', () => {
  it('login exige e-mail válido e senha', () => {
    const r = entrarSchema.safeParse({ email: 'nao-e-email', password: '' })
    expect(r.success).toBe(false)
    expect(r.error?.flatten().fieldErrors).toEqual({
      email: ['Informe um e-mail válido.'],
      password: ['Informe sua senha.'],
    })
  })

  it('cadastro exige senha ≥ 8 e termos aceitos', () => {
    const r = cadastrarSchema.safeParse({
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

  it('cadastro válido remove espaços do nome', () => {
    const r = cadastrarSchema.parse({
      name: '  Mariana Souza ',
      email: 'mariana@email.com',
      password: '12345678',
      acceptedTerms: true,
    })
    expect(r.name).toBe('Mariana Souza')
  })
})
