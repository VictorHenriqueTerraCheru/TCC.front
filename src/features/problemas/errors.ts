import { isApiError, isErroDeRede } from '@/infrastructure/api'

const mensagens: Record<string, string> = {
  'author-cannot-vote': 'Você registrou este problema; quem registra não vota nele.',
  'issue-resolved': 'Este problema já foi resolvido.',
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
