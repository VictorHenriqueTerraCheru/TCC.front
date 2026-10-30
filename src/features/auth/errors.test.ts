import type { UseFormSetError } from 'react-hook-form'

import { ApiError } from '@/infrastructure/api'

import { applyAuthError } from './errors'

interface Form {
  name: string
  email: string
  password: string
}

const fields: (keyof Form)[] = ['name', 'email', 'password']

function apply(error: unknown) {
  const setError = vi.fn()
  const message = applyAuthError(error, setError as unknown as UseFormSetError<Form>, fields)
  return { message, setError }
}

describe('applyAuthError', () => {
  it('network failure becomes a general message, without touching the fields', () => {
    const { message, setError } = apply(new TypeError('Failed to fetch'))

    expect(message).toBe('Sem conexão. Tente de novo.')
    expect(setError).not.toHaveBeenCalled()
  })

  it('error that is not from the API becomes a generic message', () => {
    expect(apply(new Error('boom')).message).toBe('Algo deu errado. Tente de novo.')
  })

  it('e-mail in use (409) goes to the e-mail field', () => {
    const { message, setError } = apply(new ApiError(409, { type: 'email-already-registered' }))

    expect(message).toBeNull()
    expect(setError).toHaveBeenCalledWith('email', {
      message: 'Já existe uma conta com este e-mail.',
    })
  })

  it('401 on login becomes "E-mail ou senha inválidos."', () => {
    expect(apply(new ApiError(401)).message).toBe('E-mail ou senha inválidos.')
  })

  it('validation errors (400) go to the known fields', () => {
    const { message, setError } = apply(
      new ApiError(400, { errors: { email: ['E-mail inválido.'], password: ['Mínimo de 8.'] } }),
    )

    expect(message).toBeNull()
    expect(setError).toHaveBeenCalledWith('email', { message: 'E-mail inválido.' })
    expect(setError).toHaveBeenCalledWith('password', { message: 'Mínimo de 8.' })
    expect(setError).toHaveBeenCalledTimes(2)
  })

  it('validation of a field the form does not have falls back to the title', () => {
    const { message, setError } = apply(
      new ApiError(400, { title: 'Dados inválidos', errors: { other: ['x'] } }),
    )

    expect(message).toBe('Dados inválidos')
    expect(setError).not.toHaveBeenCalled()
  })

  it('without field or title, uses the default message', () => {
    expect(apply(new ApiError(500)).message).toBe('Não foi possível continuar.')
  })
})
