import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import { isApiError, isErroDeRede } from '@/infrastructure/api'

/**
 * Leva o erro da API para o formulário: validação (400) e e-mail em uso (409) vão para o
 * campo; o resto vira mensagem geral (devolvida).
 */
export function aplicarErroAuth<T extends FieldValues>(
  erro: unknown,
  setError: UseFormSetError<T>,
  campos: Path<T>[],
): string | null {
  if (isErroDeRede(erro)) return 'Sem conexão. Tente de novo.'
  if (!isApiError(erro)) return 'Algo deu errado. Tente de novo.'

  if (erro.type === 'email-ja-cadastrado') {
    setError('email' as Path<T>, { message: 'Já existe uma conta com este e-mail.' })
    return null
  }
  if (erro.status === 401) return 'E-mail ou senha inválidos.'

  let algumCampo = false
  for (const campo of campos) {
    const mensagem = erro.erroDoCampo(campo)
    if (mensagem) {
      setError(campo, { message: mensagem })
      algumCampo = true
    }
  }
  return algumCampo ? null : (erro.title ?? 'Não foi possível continuar.')
}
