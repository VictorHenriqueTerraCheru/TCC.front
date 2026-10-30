import { isApiError } from '@/infrastructure/api'

const messages: Record<string, string> = {
  'category-not-issue': 'Essa categoria é de incidente. Volte e escolha de novo.',
  'category-not-incident': 'Essa categoria é de problema. Volte e escolha de novo.',
  'time-outside-window':
    'O horário precisa estar dentro das últimas 24 horas. Ajuste e envie de novo.',
  'daily-incident-limit':
    'Você chegou ao limite de relatos de incidente nas últimas 24 horas. Tente mais tarde.',
  'author-cannot-vote': 'Esse registro é seu: quem registra não vota nele.',
}

export function reportErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.type && messages[error.type]) return messages[error.type]!
    const firstField = Object.values(error.errors)[0]?.[0]
    if (firstField) return firstField
    if (error.title) return error.title
  }
  return 'Não foi possível enviar. Tente de novo.'
}
