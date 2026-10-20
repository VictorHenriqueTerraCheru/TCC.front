import type { UseFormSetError } from 'react-hook-form'

import { ApiError } from '@/infrastructure/api'

import { aplicarErroAuth } from './errors'

interface Form {
  nome: string
  email: string
  senha: string
}

const campos: (keyof Form)[] = ['nome', 'email', 'senha']

function aplicar(erro: unknown) {
  const setError = vi.fn()
  const mensagem = aplicarErroAuth(erro, setError as unknown as UseFormSetError<Form>, campos)
  return { mensagem, setError }
}

describe('aplicarErroAuth', () => {
  it('falha de rede vira mensagem geral, sem tocar nos campos', () => {
    const { mensagem, setError } = aplicar(new TypeError('Failed to fetch'))

    expect(mensagem).toBe('Sem conexão. Tente de novo.')
    expect(setError).not.toHaveBeenCalled()
  })

  it('erro que não é da API vira mensagem genérica', () => {
    expect(aplicar(new Error('boom')).mensagem).toBe('Algo deu errado. Tente de novo.')
  })

  it('e-mail em uso (409) vai para o campo e-mail', () => {
    const { mensagem, setError } = aplicar(new ApiError(409, { type: 'email-ja-cadastrado' }))

    expect(mensagem).toBeNull()
    expect(setError).toHaveBeenCalledWith('email', {
      message: 'Já existe uma conta com este e-mail.',
    })
  })

  it('401 no login vira "E-mail ou senha inválidos."', () => {
    expect(aplicar(new ApiError(401)).mensagem).toBe('E-mail ou senha inválidos.')
  })

  it('erros de validação (400) vão para os campos conhecidos', () => {
    const { mensagem, setError } = aplicar(
      new ApiError(400, { errors: { email: ['E-mail inválido.'], senha: ['Mínimo de 8.'] } }),
    )

    expect(mensagem).toBeNull()
    expect(setError).toHaveBeenCalledWith('email', { message: 'E-mail inválido.' })
    expect(setError).toHaveBeenCalledWith('senha', { message: 'Mínimo de 8.' })
    expect(setError).toHaveBeenCalledTimes(2)
  })

  it('validação de campo que o formulário não tem cai no título', () => {
    const { mensagem, setError } = aplicar(
      new ApiError(400, { title: 'Dados inválidos', errors: { outro: ['x'] } }),
    )

    expect(mensagem).toBe('Dados inválidos')
    expect(setError).not.toHaveBeenCalled()
  })

  it('sem campo nem título, usa a mensagem padrão', () => {
    expect(aplicar(new ApiError(500)).mensagem).toBe('Não foi possível continuar.')
  })
})
