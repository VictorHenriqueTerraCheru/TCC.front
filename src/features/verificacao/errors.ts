import { isApiError, isErroDeRede } from '@/infrastructure/api'

const mensagens: Record<string, string> = {
  'verificacao-pendente-existente':
    'Você já tem um pedido em análise. Aguarde a resposta da moderação.',
  'ja-verificado': 'Seu perfil já é verificado.',
  'verificacao-ja-analisada': 'Este pedido já foi analisado por outra pessoa.',
}

export function mensagemErroVerificacao(erro: unknown): string {
  if (isErroDeRede(erro)) return 'Sem conexão. Tente de novo.'
  if (isApiError(erro)) {
    if (erro.type && mensagens[erro.type]) return mensagens[erro.type]!
    const campo = Object.values(erro.errors)[0]?.[0]
    if (campo) return campo
    if (erro.title) return erro.title
  }
  return 'Não foi possível concluir. Tente de novo.'
}
