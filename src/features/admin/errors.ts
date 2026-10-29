import { isApiError, isErroDeRede } from '@/infrastructure/api'

const mensagens: Record<string, string> = {
  'duplicate-name': 'Já existe uma categoria com este nome.',
  'group-type-mismatch': 'O grupo escolhido é de outro tipo (Estado ou Evento).',
  'duplicate-group-label': 'Já existe um grupo com este nome.',
  'own-role': 'Você não pode alterar o seu próprio perfil.',
  'group-in-use':
    'Este grupo ainda tem categorias (inclusive desativadas). Mova todas para outro grupo antes de apagar.',
}

function traduzir(erro: unknown): string {
  if (isErroDeRede(erro)) return 'Sem conexão. Tente de novo.'
  if (isApiError(erro)) {
    if (erro.type && mensagens[erro.type]) return mensagens[erro.type]!
    const campo = Object.values(erro.errors)[0]?.[0]
    if (campo) return campo
    if (erro.title) return erro.title
  }
  return 'Não foi possível concluir. Tente de novo.'
}

export const mensagemErroCategorias = traduzir
export const mensagemErroUsuarios = traduzir
