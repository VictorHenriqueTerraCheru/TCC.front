import { isApiError, isErroDeRede } from '@/infrastructure/api'

const mensagens: Record<string, string> = {
  'verification-already-pending':
    'Você já tem um pedido em análise. Aguarde a resposta da moderação.',
  'already-verified': 'Seu perfil já é verificado.',
  'verification-already-reviewed': 'Este pedido já foi analisado por outra pessoa.',
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
