import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import { isApiError, isNetworkError } from '@/infrastructure/api'

export function applyAuthError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: Path<T>[],
): string | null {
  if (isNetworkError(error)) return 'Sem conexão. Tente de novo.'
  if (!isApiError(error)) return 'Algo deu errado. Tente de novo.'

  if (error.type === 'email-already-registered') {
    setError('email' as Path<T>, { message: 'Já existe uma conta com este e-mail.' })
    return null
  }
  if (error.status === 401) return 'E-mail ou senha inválidos.'

  let anyField = false
  for (const field of fields) {
    const message = error.fieldError(field)
    if (message) {
      setError(field, { message })
      anyField = true
    }
  }
  return anyField ? null : (error.title ?? 'Não foi possível continuar.')
}
