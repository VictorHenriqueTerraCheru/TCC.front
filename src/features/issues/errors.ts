import { isApiError, isNetworkError } from '@/infrastructure/api'

const messages: Record<string, string> = {
  'author-cannot-vote': 'Você registrou este problema; quem registra não vota nele.',
  'issue-resolved': 'Este problema já foi resolvido.',
}

export function voteErrorMessage(error: unknown): string {
  if (isNetworkError(error)) return 'Sem conexão. Tente de novo.'
  if (isApiError(error)) {
    if (error.type && messages[error.type]) return messages[error.type]!
    if (error.status === 401) return 'Sua sessão expirou. Entre de novo para votar.'
    if (error.status === 404) return 'Este problema não está mais disponível.'
    if (error.title) return error.title
  }
  return 'Não foi possível registrar seu voto.'
}
