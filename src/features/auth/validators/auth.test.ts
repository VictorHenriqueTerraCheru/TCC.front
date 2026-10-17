import { cadastrarSchema, entrarSchema } from './auth'

describe('validadores de auth', () => {
  it('login exige e-mail válido e senha', () => {
    const r = entrarSchema.safeParse({ email: 'nao-e-email', senha: '' })
    expect(r.success).toBe(false)
    expect(r.error?.flatten().fieldErrors).toEqual({
      email: ['Informe um e-mail válido.'],
      senha: ['Informe sua senha.'],
    })
  })

  it('cadastro exige senha ≥ 8 e termos aceitos', () => {
    const r = cadastrarSchema.safeParse({
      nome: ' Ana ',
      email: 'ana@x.com',
      senha: '1234567',
      aceitouTermos: false,
    })
    expect(r.error?.flatten().fieldErrors).toEqual({
      senha: ['Mínimo de 8 caracteres'],
      aceitouTermos: ['Aceite os termos para criar a conta.'],
    })
  })

  it('cadastro válido remove espaços do nome', () => {
    const r = cadastrarSchema.parse({
      nome: '  Mariana Souza ',
      email: 'mariana@email.com',
      senha: '12345678',
      aceitouTermos: true,
    })
    expect(r.nome).toBe('Mariana Souza')
  })
})
