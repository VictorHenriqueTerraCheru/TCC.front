import { isApiError, isErroDeRede } from '@/infrastructure/api'

// type da API (docs/API.md, "Códigos de erro") → mensagem para o usuário.
const mensagens: Record<string, string> = {
  'autor-nao-vota-existencia':
    'Você registrou este problema; quem registra não confirma a existência.',
  'persistencia-indisponivel-em-nova': '"Ainda está lá?" abre depois da avaliação.',
  'problema-resolvido': 'Este problema já foi resolvido.',
}

export function mensagemErroVoto(erro: unknown): string {
  if (isErroDeRede(erro)) return 'Sem conexão. Tente de novo.'
  if (isApiError(erro)) {
    if (erro.type && mensagens[erro.type]) return mensagens[erro.type]!
    if (erro.status === 401) return 'Sua sessão expirou. Entre de novo para votar.'
    if (erro.status === 404) return 'Este problema não está mais disponível.'
    if (erro.title) return erro.title
  }
  return 'Não foi possível registrar seu voto.'
}
