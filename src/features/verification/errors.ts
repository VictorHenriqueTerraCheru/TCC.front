import { isApiError, isNetworkError } from '@/infrastructure/api'

const messages: Record<string, string> = {
  'verification-already-pending':
    'Você já tem um pedido em análise. Aguarde a resposta da moderação.',
  'already-verified': 'Seu perfil já é verificado.',
  'verification-already-reviewed': 'Este pedido já foi analisado por outra pessoa.',
}

export function verificationErrorMessage(error: unknown): string {
  if (isNetworkError(error)) return 'Sem conexão. Tente de novo.'
  if (isApiError(error)) {
    if (error.type && messages[error.type]) return messages[error.type]!
    const field = Object.values(error.errors)[0]?.[0]
    if (field) return field
    if (error.title) return error.title
  }
  return 'Não foi possível concluir. Tente de novo.'
}
