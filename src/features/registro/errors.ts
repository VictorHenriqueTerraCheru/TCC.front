import { isApiError } from '@/infrastructure/api'

// type da API → mensagem (docs/API.md, "Códigos de erro").
const mensagens: Record<string, string> = {
  'categoria-nao-e-problema': 'Essa categoria é de incidente. Volte e escolha de novo.',
  'categoria-nao-e-incidente': 'Essa categoria é de problema. Volte e escolha de novo.',
  'horario-fora-da-janela':
    'O horário precisa estar dentro das últimas 24 horas. Ajuste e envie de novo.',
  'limite-diario-incidentes':
    'Você chegou ao limite de relatos de incidente nas últimas 24 horas. Tente mais tarde.',
  'autor-nao-vota': 'Esse registro é seu: quem registra não vota nele.',
}

/** Mensagem para erros de regra (4xx). Falha de rede é tratada à parte (tela 26). */
export function mensagemErroRegistro(erro: unknown): string {
  if (isApiError(erro)) {
    if (erro.type && mensagens[erro.type]) return mensagens[erro.type]!
    const primeiroCampo = Object.values(erro.errors)[0]?.[0]
    if (primeiroCampo) return primeiroCampo
    if (erro.title) return erro.title
  }
  return 'Não foi possível enviar. Tente de novo.'
}
