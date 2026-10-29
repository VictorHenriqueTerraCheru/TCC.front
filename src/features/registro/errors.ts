import { isApiError } from '@/infrastructure/api'

const mensagens: Record<string, string> = {
  'category-not-issue': 'Essa categoria é de incidente. Volte e escolha de novo.',
  'category-not-incident': 'Essa categoria é de problema. Volte e escolha de novo.',
  'time-outside-window':
    'O horário precisa estar dentro das últimas 24 horas. Ajuste e envie de novo.',
  'daily-incident-limit':
    'Você chegou ao limite de relatos de incidente nas últimas 24 horas. Tente mais tarde.',
  'author-cannot-vote': 'Esse registro é seu: quem registra não vota nele.',
}

export function mensagemErroRegistro(erro: unknown): string {
  if (isApiError(erro)) {
    if (erro.type && mensagens[erro.type]) return mensagens[erro.type]!
    const primeiroCampo = Object.values(erro.errors)[0]?.[0]
    if (primeiroCampo) return primeiroCampo
    if (erro.title) return erro.title
  }
  return 'Não foi possível enviar. Tente de novo.'
}
